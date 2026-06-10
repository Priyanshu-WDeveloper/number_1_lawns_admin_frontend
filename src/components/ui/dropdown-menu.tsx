import * as React from 'react';
import { cn } from '@/lib/utils';

/* =========================================================
   CONTEXT
========================================================= */

interface DropdownMenuContextValue {
  open: boolean;
  setOpen: (open: boolean) => void;
  triggerRef: React.RefObject<HTMLElement | null>;
}

const DropdownMenuContext =
  React.createContext<DropdownMenuContextValue | null>(null);

function useDropdownMenuContext() {
  const context = React.useContext(DropdownMenuContext);

  if (!context) {
    throw new Error(
      'DropdownMenu components must be used within a DropdownMenu',
    );
  }

  return context;
}

/* =========================================================
   ROOT
========================================================= */

interface DropdownMenuProps {
  children?: React.ReactNode;
}

function DropdownMenu({ children }: DropdownMenuProps) {
  const [open, setOpen] = React.useState(false);

  const triggerRef = React.useRef<HTMLElement>(null);

  return (
    <DropdownMenuContext.Provider
      value={{
        open,
        setOpen,
        triggerRef,
      }}
    >
      {children}
    </DropdownMenuContext.Provider>
  );
}

/* =========================================================
   TRIGGER
========================================================= */

interface DropdownMenuTriggerProps extends React.ComponentProps<'button'> {
  asChild?: boolean;
}

function DropdownMenuTrigger({
  children,
  asChild = false,
  ...props
}: DropdownMenuTriggerProps) {
  const { open, setOpen, triggerRef } = useDropdownMenuContext();

  const handleClick = (e: React.MouseEvent<HTMLElement>) => {
    props.onClick?.(e as React.MouseEvent<HTMLButtonElement>);

    setOpen(!open);
  };

  if (asChild && React.isValidElement(children)) {
    const child = children as React.ReactElement<{
      onClick?: React.MouseEventHandler<HTMLElement>;
    }>;

    return React.cloneElement(
      child as React.ReactElement<Record<string, unknown>>,
      { ref: triggerRef, onClick: (e: React.MouseEvent<HTMLElement>) => {
        child.props.onClick?.(e);

        handleClick(e);
      } },
    );
  }

  return (
    <button
      ref={triggerRef as React.RefObject<HTMLButtonElement>}
      type="button"
      data-slot="dropdown-menu-trigger"
      onClick={handleClick}
      {...props}
    >
      {children}
    </button>
  );
}

/* =========================================================
   CONTENT
========================================================= */

interface DropdownMenuContentProps extends React.ComponentProps<'div'> {
  align?: 'start' | 'center' | 'end';
  sideOffset?: number;
}

function DropdownMenuContent({
  className,
  align = 'start',
  sideOffset = 4,
  children,
  ...props
}: DropdownMenuContentProps) {
  const { open, setOpen, triggerRef } = useDropdownMenuContext();

  const contentRef = React.useRef<HTMLDivElement>(null);

  /* ================================
     OUTSIDE CLICK
  ================================= */

  React.useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        contentRef.current &&
        !contentRef.current.contains(event.target as Node)
      ) {
        const trigger = triggerRef.current;

        if (trigger && trigger.contains(event.target as Node)) {
          return;
        }

        setOpen(false);
      }
    }

    if (open) {
      document.addEventListener('mousedown', handleClickOutside);

      return () => {
        document.removeEventListener('mousedown', handleClickOutside);
      };
    }
  }, [open, setOpen, triggerRef]);

  /* ================================
     ESC CLOSE
  ================================= */

  React.useEffect(() => {
    function handleEscape(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        setOpen(false);
      }
    }

    if (open) {
      document.addEventListener('keydown', handleEscape);

      return () => {
        document.removeEventListener('keydown', handleEscape);
      };
    }
  }, [open, setOpen]);

  /* ================================
     POSITIONING
  ================================= */

  React.useEffect(() => {
    if (!open || !contentRef.current) return;

    const content = contentRef.current;

    const updatePosition = () => {
      const trigger = triggerRef.current;

      if (!trigger) return;

      const triggerRect = trigger.getBoundingClientRect();

      const contentRect = content.getBoundingClientRect();

      if (contentRect.width === 0 || contentRect.height === 0) {
        return;
      }

      let left = triggerRect.left;

      if (align === 'end') {
        left = triggerRect.right - contentRect.width;
      }

      if (align === 'center') {
        left =
          triggerRect.left +
          (triggerRect.width - contentRect.width) / 2;
      }

      if (left < 8) {
        left = 8;
      }

      const maxLeft = window.innerWidth - contentRect.width - 8;

      if (left > maxLeft) {
        left = maxLeft;
      }

      const spaceBelow = window.innerHeight - triggerRect.bottom;

      const shouldFlip = spaceBelow < contentRect.height + sideOffset;

      let top = triggerRect.bottom + sideOffset;

      if (shouldFlip) {
        top = triggerRect.top - contentRect.height - sideOffset;
      }

      content.style.top = `${top}px`;
      content.style.left = `${left}px`;
    };

    const frame = requestAnimationFrame(updatePosition);

    const resizeObserver = new ResizeObserver(updatePosition);

    resizeObserver.observe(content);

    window.addEventListener('resize', updatePosition);

    window.addEventListener('scroll', updatePosition, true);

    return () => {
      cancelAnimationFrame(frame);

      resizeObserver.disconnect();

      window.removeEventListener('resize', updatePosition);

      window.removeEventListener('scroll', updatePosition, true);
    };
  }, [open, align, sideOffset, triggerRef]);

  return (
    <div
      ref={contentRef}
      data-slot="dropdown-menu-content"
      className={cn(
        `
        fixed
        z-50
        min-w-40
        overflow-hidden
        rounded-xl
        border
        border-border
        bg-popover
        p-1
        text-popover-foreground
        shadow-xl
        transition-all
        duration-100
        `,
        className,
      )}
      style={{
        visibility: open ? 'visible' : 'hidden',
        opacity: open ? 1 : 0,
      }}
      {...props}
    >
      {children}
    </div>
  );
}

/* =========================================================
   ITEM
========================================================= */

interface DropdownMenuItemProps extends React.ComponentProps<'button'> {
  inset?: boolean;
  variant?: 'default' | 'destructive';
}

function DropdownMenuItem({
  className,
  inset,
  variant = 'default',
  onClick,
  children,
  ...props
}: DropdownMenuItemProps) {
  const { setOpen } = useDropdownMenuContext();

  return (
    <button
      type="button"
      data-slot="dropdown-menu-item"
      data-inset={inset}
      data-variant={variant}
      className={cn(
        `
        relative
        flex
        w-full
        cursor-pointer
        items-center
        gap-2
        rounded-lg
        px-3
        py-2
        text-sm
        transition-colors
        outline-none
        select-none

        hover:bg-muted

        focus-visible:outline-none
        focus-visible:ring-2
        focus-visible:ring-ring

        data-[variant=destructive]:text-red-500
        `,
        className,
      )}
      onClick={(e) => {
        onClick?.(e);
        setOpen(false);
      }}
      {...props}
    >
      {children}
    </button>
  );
}

/* =========================================================
   SEPARATOR
========================================================= */

function DropdownMenuSeparator({
  className,
  ...props
}: React.ComponentProps<'div'>) {
  return (
    <div
      className={cn('my-1 h-px bg-border', className)}
      {...props}
    />
  );
}

/* =========================================================
   LABEL
========================================================= */

function DropdownMenuLabel({
  className,
  ...props
}: React.ComponentProps<'div'>) {
  return (
    <div
      className={cn(
        'px-3 py-2 text-xs font-medium text-muted-foreground',
        className,
      )}
      {...props}
    />
  );
}

/* =========================================================
   SHORTCUT
========================================================= */

function DropdownMenuShortcut({
  className,
  ...props
}: React.ComponentProps<'span'>) {
  return (
    <span
      className={cn(
        'ml-auto text-xs text-muted-foreground',
        className,
      )}
      {...props}
    />
  );
}

export {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuLabel,
  DropdownMenuShortcut,
};
