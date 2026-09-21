# =============================================================================
# COLD CHAIN FORECASTING — PATCH
# Drop-in replacements for cells 14, 16, 20, 22, 25 of forecasting2.ipynb.
# Everything before cell 14 (loading, interpolation, cyclical encoding,
# scaling) stays exactly as it is.
#
# Core change: the network no longer predicts the LEVEL of t_air_c / rh_pct.
# It predicts the DEVIATION from the last observed value, and that value is
# added back at the output. The head is zero-initialised, so the model starts
# life as the persistence baseline and training can only move it away from
# there if that reduces loss.
# =============================================================================


# -----------------------------------------------------------------------------
# REPLACES CELL 14 — windowing, now anchored
# -----------------------------------------------------------------------------
T_IDX = FEATURES.index("t_air_c")
H_IDX = FEATURES.index("rh_pct")


def make_windows(df, split, n_past=N_PAST, n_future=N_FUTURE, stride=1):
    """Slide windows within each trip. Never crosses trip boundaries.

    Returns X anchored: the two target channels inside the window are
    expressed relative to the last observed value, and that anchor is
    appended as two extra constant channels so absolute level is still
    available to the model if it turns out to matter.
    """
    X, y, anchor = [], [], []
    subset = df[df.split == split]

    for _, g in subset.groupby("trip_id", sort=False):
        feats = g[FEATURES].values.astype(np.float32)
        targs = g[Y_COLS].values.astype(np.float32)
        n_windows = len(g) - n_past - n_future + 1
        if n_windows <= 0:
            continue
        for i in range(0, n_windows, stride):
            w = feats[i : i + n_past].copy()
            a = targs[i + n_past - 1]                    # last observed target
            w[:, T_IDX] -= a[0]
            w[:, H_IDX] -= a[1]
            w = np.concatenate(
                [w, np.repeat(a[None, :], n_past, axis=0)], axis=1
            )                                            # -> n_past x (F+2)
            X.append(w)
            y.append(targs[i + n_past : i + n_past + n_future])
            anchor.append(a)

    return (
        np.array(X, dtype=np.float32),
        np.array(y, dtype=np.float32),
        np.array(anchor, dtype=np.float32),
    )


# stride 3 on train: windows at stride 1 overlap 119/120, so they are almost
# duplicates. Fewer, less-correlated windows -> faster epochs, less overfit.
X_train, y_train, anchor_train = make_windows(scaled, "train", stride=3)
X_val,   y_val,   anchor_val   = make_windows(scaled, "val")
X_test,  y_test,  anchor_test  = make_windows(scaled, "test")

N_IN = X_train.shape[-1]          # N_FEATURES + 2 anchor channels
print("input channels:", N_IN)
for nm, X, y in [("train", X_train, y_train), ("val", X_val, y_val), ("test", X_test, y_test)]:
    print(f"{nm:5s} X {X.shape}  y {y.shape}")


# -----------------------------------------------------------------------------
# REPLACES CELL 16 — same reporting helpers, plus a noise-floor probe
# -----------------------------------------------------------------------------
def inverse_targets(arr):
    flat = arr.reshape(-1, 2)
    return targ_scaler.inverse_transform(flat).reshape(arr.shape)


def report(y_true_scaled, y_pred_scaled, label):
    y_true = inverse_targets(y_true_scaled)
    y_pred = inverse_targets(y_pred_scaled)
    err = np.abs(y_true - y_pred)
    rmse = np.sqrt(((y_true - y_pred) ** 2).reshape(-1, 2).mean(axis=0))
    mae = err.reshape(-1, 2).mean(axis=0)
    print(label)
    print(f"  t_air_c  MAE {mae[0]:.4f} C     RMSE {rmse[0]:.4f}")
    print(f"  rh_pct   MAE {mae[1]:.4f} %RH   RMSE {rmse[1]:.4f}")
    return mae


persist_test = np.repeat(anchor_test[:, None, :], N_FUTURE, axis=1)
baseline_mae = report(y_test, persist_test, "PERSISTENCE BASELINE (test)")

# How much of the minute-to-minute movement is even predictable? Smooth each
# true future trajectory with a centred 5-minute window — an oracle, since it
# peeks forward — and measure what is left over. That leftover is the
# high-frequency component no causal model can recover, and it is a realistic
# floor to judge MAE against instead of judging it against zero.
from scipy.ndimage import uniform_filter1d

yt = inverse_targets(y_test)
oracle = uniform_filter1d(yt, size=5, axis=1, mode="nearest")
floor = np.abs(yt - oracle).reshape(-1, 2).mean(0)
print(f"\nunpredictable high-frequency component: t_air {floor[0]:.3f} C, rh {floor[1]:.3f} %RH")
print("(an honest target is somewhere between this and the persistence numbers above)")


# -----------------------------------------------------------------------------
# REPLACES CELL 20 — residual model with a persistence skip connection
# -----------------------------------------------------------------------------
class ResidualLSTMForecaster(nn.Module):
    """Predicts y[t+h] - y[t_last] and adds y[t_last] back.

    The anchor is carried around the recurrent stack, so the network never has
    to spend hidden units memorising the current temperature level — it only
    has to model the dynamics on top of it.
    """

    def __init__(self, n_features, n_future, n_targets,
                 hidden1=96, hidden2=64, dropout=0.15, n_tail=12):
        super().__init__()
        self.n_future = n_future
        self.n_targets = n_targets
        self.n_tail = n_tail            # raw recent steps fed straight to head

        self.lstm1 = nn.LSTM(n_features, hidden1, batch_first=True)
        self.drop1 = nn.Dropout(dropout)
        self.lstm2 = nn.LSTM(hidden1, hidden2, batch_first=True)
        self.drop2 = nn.Dropout(dropout)

        head_in = hidden2 + n_tail * n_targets
        self.head = nn.Sequential(
            nn.Linear(head_in, 128),
            nn.GELU(),
            nn.Linear(128, n_future * n_targets),
        )
        # Start as an exact copy of the persistence baseline.
        nn.init.zeros_(self.head[-1].weight)
        nn.init.zeros_(self.head[-1].bias)

    def forward(self, x):
        # x: (batch, N_PAST, n_features). Last 2 channels are the anchor.
        anchor = x[:, -1, -self.n_targets:]                 # (batch, 2)
        tail = x[:, -self.n_tail:, [T_IDX, H_IDX]].reshape(x.size(0), -1)

        out, _ = self.lstm1(x)
        out = self.drop1(out)
        out, (h_n, _) = self.lstm2(out)
        h = self.drop2(h_n[-1])

        delta = self.head(torch.cat([h, tail], dim=1))
        delta = delta.view(-1, self.n_future, self.n_targets)
        return delta + anchor[:, None, :]                   # back to level space


model = ResidualLSTMForecaster(N_IN, N_FUTURE, len(TARGETS)).to(device)
print(model)
print(f"\ntrainable parameters: {sum(p.numel() for p in model.parameters()):,}")


# -----------------------------------------------------------------------------
# REPLACES CELL 22 — training loop
# -----------------------------------------------------------------------------
# Changes that matter:
#   * L1Loss, not SmoothL1(beta=1.0). On standardised targets almost every
#     error is well under 1.0, so the old "Huber" was running in its quadratic
#     region — i.e. it was MSE, which fits the conditional MEAN while the
#     reported metric is MAE, which wants the conditional MEDIAN.
#   * weight_decay + gradient clipping (LSTMs on 120 steps need the clip).
#   * PATIENCE raised — the old run stopped at epoch 13 with best weights from
#     epoch 3, i.e. the saved model was barely trained.
import copy

EPOCHS      = 150
PATIENCE    = 20
LR_PATIENCE = 6
LR_FACTOR   = 0.5
MIN_LR      = 1e-5
CLIP        = 1.0

criterion = nn.L1Loss()
optimizer = torch.optim.AdamW(model.parameters(), lr=1e-3, weight_decay=1e-4)
scheduler = torch.optim.lr_scheduler.ReduceLROnPlateau(
    optimizer, mode="min", factor=LR_FACTOR, patience=LR_PATIENCE, min_lr=MIN_LR
)


def run_epoch(loader, model, criterion, optimizer=None):
    is_train = optimizer is not None
    model.train(is_train)
    total_loss, n = 0.0, 0

    with torch.set_grad_enabled(is_train):
        for xb, yb in loader:
            xb, yb = xb.to(device), yb.to(device)
            preds = model(xb)
            loss = criterion(preds, yb)

            if is_train:
                optimizer.zero_grad()
                loss.backward()
                nn.utils.clip_grad_norm_(model.parameters(), CLIP)
                optimizer.step()

            bs = xb.size(0)
            total_loss += loss.item() * bs
            n += bs

    return total_loss / n


history = {"loss": [], "val_loss": []}
best_val_loss, best_state, epochs_no_improve = float("inf"), None, 0

for epoch in range(1, EPOCHS + 1):
    train_loss = run_epoch(train_loader, model, criterion, optimizer)
    val_loss   = run_epoch(val_loader, model, criterion, optimizer=None)
    scheduler.step(val_loss)

    history["loss"].append(train_loss)
    history["val_loss"].append(val_loss)

    improved = val_loss < best_val_loss - 1e-6
    if improved:
        best_val_loss, best_state, epochs_no_improve = val_loss, copy.deepcopy(model.state_dict()), 0
    else:
        epochs_no_improve += 1

    print(f"epoch {epoch:3d}  loss {train_loss:.4f}  val_loss {val_loss:.4f}  "
          f"lr {optimizer.param_groups[0]['lr']:.2e}" + ("  *" if improved else ""))

    if epochs_no_improve >= PATIENCE:
        print(f"\nearly stopping at epoch {epoch}")
        break

model.load_state_dict(best_state)
print(f"\nrestored best weights, val_loss = {best_val_loss:.4f}")


# -----------------------------------------------------------------------------
# REPLACES CELL 25 — evaluation, with the per-horizon sanity check inline
# -----------------------------------------------------------------------------
model.eval()
preds = []
with torch.no_grad():
    for xb, _ in test_loader:
        preds.append(model(xb.to(device)).cpu().numpy())
y_pred = np.concatenate(preds, axis=0)

model_mae = report(y_test, y_pred, "RESIDUAL LSTM (test)")
print()
baseline_mae = report(y_test, persist_test, "PERSISTENCE (test)")

print("\nimprovement over baseline:")
for i, name in enumerate(TARGETS):
    delta = (baseline_mae[i] - model_mae[i]) / baseline_mae[i] * 100
    print(f"  {name:10s} {delta:+6.1f}%   {'beats baseline' if delta > 0 else 'WORSE'}")

# The check the old model failed: at h=1 a sane model must be no worse than
# persistence. If it is worse, the anchor is not reaching the output.
yi, pi, si = inverse_targets(y_test), inverse_targets(y_pred), inverse_targets(persist_test)
m1 = np.abs(yi[:, 0, :] - pi[:, 0, :]).mean(0)
b1 = np.abs(yi[:, 0, :] - si[:, 0, :]).mean(0)
print(f"\nh=1 MAE   model {m1.round(4)}  persistence {b1.round(4)}")
assert (m1 <= b1 * 1.02).all(), "still not anchored at h=1 — check the skip connection"


# -----------------------------------------------------------------------------
# REPLACES CELL 29 — spot-check plot
# The target channels inside X_test are now anchor-centred, so the anchor has
# to be added back before inverse_transform or the history line lands in the
# wrong place on the y-axis.
# -----------------------------------------------------------------------------
y_true_inv, y_pred_inv = inverse_targets(y_test), inverse_targets(y_pred)
steps = np.arange(1, N_FUTURE + 1)

idx = np.random.choice(len(X_test), 3, replace=False)
fig, axes = plt.subplots(len(idx), 2, figsize=(13, 3.2 * len(idx)))
for r, j in enumerate(idx):
    centred = X_test[j][:, [T_IDX, H_IDX]]
    hist = targ_scaler.inverse_transform(centred + anchor_test[j])
    for c, (name, unit) in enumerate(zip(TARGETS, ["C", "%RH"])):
        ax = axes[r, c]
        ax.plot(np.arange(-N_PAST, 0), hist[:, c], color="gray", label="history")
        ax.plot(steps, y_true_inv[j, :, c], "o-", ms=3, label="actual")
        ax.plot(steps, y_pred_inv[j, :, c], "s-", ms=3, label="predicted")
        ax.axvline(0, color="k", lw=0.8, ls=":")
        ax.set_title(f"sample {j} - {name}"); ax.set_ylabel(unit); ax.grid(alpha=0.3)
        if r == 0 and c == 0:
            ax.legend(fontsize=8)
plt.tight_layout(); plt.show()


# -----------------------------------------------------------------------------
# NOTE for cell 31 (saving): config must record the new channel count, or
# reloading builds a model with the wrong input size.
#   "n_features": N_IN,  "hidden1": 96, "hidden2": 64, "dropout": 0.15,
#   "n_tail": 12, "anchored": True
# -----------------------------------------------------------------------------
