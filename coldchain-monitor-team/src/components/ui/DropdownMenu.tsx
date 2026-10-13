import { useRef, useState, type ReactNode } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { useOnClickOutside } from '@/hooks/useOnClickOutside';
import { cn } from '@/utils/cn';

export interface DropdownMenuProps {
  /** Render-prop trigger so the caller controls the button styling. */
  trigger: (props: { isOpen: boolean; toggle: () => void }) => ReactNode;
  children: ReactNode | ((props: { close: () => void }) => ReactNode);
  align?: 'left' | 'right';
  /** Tailwind width class for the panel. */
  width?: string;
  className?: string;
}

/**
 * Anchored popover panel with click-outside and Escape handling.
 * Used by the notification feed and the profile menu.
 */
export function DropdownMenu({
  trigger,
  children,
  align = 'right',
  width = 'w-64',
  className,
}: DropdownMenuProps) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useOnClickOutside(containerRef, () => setIsOpen(false), isOpen);

  const close = () => setIsOpen(false);

  return (
    <div ref={containerRef} className="relative">
      {trigger({ isOpen, toggle: () => setIsOpen((previous) => !previous) })}

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            transition={{ duration: 0.15, ease: 'easeOut' }}
            className={cn(
              'absolute top-[calc(100%+8px)] z-popover overflow-hidden rounded-card border border-line bg-surface shadow-popover',
              align === 'right' ? 'right-0' : 'left-0',
              width,
              className,
            )}
            role="menu"
          >
            {typeof children === 'function' ? children({ close }) : children}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

/** Standard row inside a dropdown panel. */
export function DropdownMenuItem({
  children,
  onClick,
  className,
}: {
  children: ReactNode;
  onClick?: () => void;
  className?: string;
}) {
  return (
    <button
      type="button"
      role="menuitem"
      onClick={onClick}
      className={cn(
        'flex w-full items-center gap-2.5 px-3 py-2 text-left text-sm text-content-secondary transition',
        'hover:bg-surface-hover hover:text-content-primary',
        className,
      )}
    >
      {children}
    </button>
  );
}
