"use client"

import * as React from "react"
import { cn } from "@/lib/utils"
import { CheckIcon, ChevronRightIcon } from "lucide-react"

interface DropdownMenuContextValue {
  open: boolean
  setOpen: (open: boolean) => void
}

const DropdownMenuContext = React.createContext<DropdownMenuContextValue | null>(null)

function useDropdownMenuContext() {
  const context = React.useContext(DropdownMenuContext)
  if (!context) {
    throw new Error("DropdownMenu components must be used within a DropdownMenu")
  }
  return context
}

interface DropdownMenuProps {
  children?: React.ReactNode
}

function DropdownMenu({ children }: DropdownMenuProps) {
  const [open, setOpen] = React.useState(false)

  return (
    <DropdownMenuContext.Provider value={{ open, setOpen }}>
      <div className="relative">{children}</div>
    </DropdownMenuContext.Provider>
  )
}

function DropdownMenuTrigger({ children, ...props }: React.ComponentProps<"button">) {
  const { open, setOpen } = useDropdownMenuContext()

  return (
    <button
      data-slot="dropdown-menu-trigger"
      type="button"
      onClick={() => setOpen(!open)}
      {...props}
    >
      {children}
    </button>
  )
}

interface DropdownMenuContentProps extends React.ComponentProps<"div"> {
  align?: "start" | "center" | "end"
  sideOffset?: number
}

function DropdownMenuContent({ className, align = "start", sideOffset = 4, children, ...props }: DropdownMenuContentProps) {
  const { open, setOpen } = useDropdownMenuContext()
  const contentRef = React.useRef<HTMLDivElement>(null)

  React.useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (contentRef.current && !contentRef.current.contains(event.target as Node)) {
        setOpen(false)
      }
    }
    if (open) {
      document.addEventListener("mousedown", handleClickOutside)
      return () => document.removeEventListener("mousedown", handleClickOutside)
    }
  }, [open, setOpen])

  // Reset position when closed
  React.useEffect(() => {
    if (!open && contentRef.current) {
      contentRef.current.style.top = ''
      contentRef.current.style.left = ''
    }
  }, [open])

  React.useEffect(() => {
    if (open && contentRef.current) {
      const content = contentRef.current

      // Use ResizeObserver to get accurate dimensions after layout
      const updatePosition = () => {
        const trigger = content.previousElementSibling as HTMLElement
        if (trigger && trigger.dataset.slot === "dropdown-menu-trigger") {
          const triggerRect = trigger.getBoundingClientRect()
          const contentRect = content.getBoundingClientRect()

          let left = triggerRect.left
          if (align === "end") {
            left = triggerRect.right - contentRect.width
          } else if (align === "center") {
            left = triggerRect.left + (triggerRect.width - contentRect.width) / 2
          }

          // Prevent overflow on right edge
          const maxLeft = window.innerWidth - contentRect.width - 8
          left = Math.min(Math.max(8, left), maxLeft)

          content.style.top = `${triggerRect.bottom + sideOffset}px`
          content.style.left = `${left}px`
        }
      }

      // Initial position
      updatePosition()

      // Update position when content dimensions change
      const resizeObserver = new ResizeObserver(updatePosition)
      resizeObserver.observe(content)

      return () => resizeObserver.disconnect()
    }
  }, [open, align, sideOffset])

  if (!open) return null

  return (
    <div
      ref={contentRef}
      data-slot="dropdown-menu-content"
      className={cn(
        "fixed z-50 min-w-32 overflow-hidden rounded-lg bg-popover p-1 text-popover-foreground shadow-md",
        className
      )}
      {...props}
    >
      {children}
    </div>
  )
}

function DropdownMenuGroup({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="dropdown-menu-group"
      className={cn("", className)}
      {...props}
    />
  )
}

interface DropdownMenuItemProps extends React.ComponentProps<"div"> {
  inset?: boolean
  variant?: "default" | "destructive"
}

function DropdownMenuItem({ className, inset, variant = "default", ...props }: DropdownMenuItemProps) {
  const { setOpen } = useDropdownMenuContext()

  return (
    <div
      data-slot="dropdown-menu-item"
      data-inset={inset}
      data-variant={variant}
      className={cn(
        "relative flex cursor-pointer items-center gap-1.5 rounded-md px-2 py-1.5 text-sm outline-none select-none data-[variant=destructive]:text-destructive data-disabled:pointer-events-none data-disabled:opacity-50",
        className
      )}
      onClick={() => setOpen(false)}
      {...props}
    />
  )
}

function DropdownMenuCheckboxItem({ className, children, checked, inset, ...props }: React.ComponentProps<"div"> & { inset?: boolean; checked?: boolean }) {
  const { setOpen } = useDropdownMenuContext()

  return (
    <div
      data-slot="dropdown-menu-checkbox-item"
      data-inset={inset}
      className={cn(
        "relative flex cursor-pointer items-center gap-1.5 rounded-md py-1 pr-8 pl-2 text-sm outline-none select-none",
        className
      )}
      onClick={() => setOpen(false)}
      {...props}
    >
      {checked && (
        <span className="pointer-events-none absolute right-2 flex items-center justify-center">
          <CheckIcon className="size-4" />
        </span>
      )}
      {children}
    </div>
  )
}

function DropdownMenuRadioGroup({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="dropdown-menu-radio-group"
      className={cn("", className)}
      {...props}
    />
  )
}

function DropdownMenuRadioItem({ className, children, inset, ...props }: React.ComponentProps<"div"> & { inset?: boolean }) {
  const { setOpen } = useDropdownMenuContext()

  return (
    <div
      data-slot="dropdown-menu-radio-item"
      data-inset={inset}
      className={cn(
        "relative flex cursor-pointer items-center gap-1.5 rounded-md py-1 pr-8 pl-2 text-sm outline-none select-none",
        className
      )}
      onClick={() => setOpen(false)}
      {...props}
    >
      {children}
    </div>
  )
}

interface DropdownMenuLabelProps extends React.ComponentProps<"div"> {
  inset?: boolean
}

function DropdownMenuLabel({ className, inset, ...props }: DropdownMenuLabelProps) {
  return (
    <div
      data-slot="dropdown-menu-label"
      data-inset={inset}
      className={cn("px-2 py-1 text-xs font-medium", className)}
      {...props}
    />
  )
}

function DropdownMenuSeparator({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="dropdown-menu-separator"
      className={cn("-mx-1 my-1 h-px bg-border", className)}
      {...props}
    />
  )
}

function DropdownMenuShortcut({ className, ...props }: React.ComponentProps<"span">) {
  return (
    <span
      data-slot="dropdown-menu-shortcut"
      className={cn(
        "ml-auto text-xs tracking-widest text-muted-foreground",
        className
      )}
      {...props}
    />
  )
}

function DropdownMenuSub({ children }: { children?: React.ReactNode }) {
  return (
    <div data-slot="dropdown-menu-sub" className="relative">
      {children}
    </div>
  )
}

function DropdownMenuSubTrigger({ className, inset, children, ...props }: React.ComponentProps<"div"> & { inset?: boolean }) {
  return (
    <div
      data-slot="dropdown-menu-sub-trigger"
      data-inset={inset}
      className={cn(
        "flex cursor-pointer items-center gap-1.5 rounded-md px-2 py-1.5 text-sm outline-none select-none [&_svg]:size-4",
        className
      )}
      {...props}
    >
      {children}
      <ChevronRightIcon className="ml-auto size-4" />
    </div>
  )
}

function DropdownMenuSubContent({ className, children, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="dropdown-menu-sub-content"
      className={cn(
        "absolute left-full top-0 z-50 min-w-[96px] overflow-hidden rounded-lg bg-popover p-1 shadow-lg ml-1",
        className
      )}
      {...props}
    >
      {children}
    </div>
  )
}

export {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuCheckboxItem,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuSub,
  DropdownMenuSubTrigger,
  DropdownMenuSubContent,
}