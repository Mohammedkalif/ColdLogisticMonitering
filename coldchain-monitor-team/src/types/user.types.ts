/** Signed-in operator. Replace with the real auth payload during integration. */
export interface UserProfile {
  id: string;
  name: string;
  email: string;
  role: string;
  initials: string;
  avatarUrl?: string;
  organization: string;
}
