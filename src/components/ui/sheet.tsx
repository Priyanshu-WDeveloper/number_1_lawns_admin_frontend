import * as React from "react"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { XIcon } from "lucide-react"

interface SheetProps {
  open?: boolean
  onOpenChange?: (open: boolean) => void
  children?: React.ReactNode
}

function Sheet({ open, onOpenChange, children }: SheetProps) {
  return (
    <div data-slot="sheet">
      {React.Children.map(children, (child) => {
        if (React.isValidElement(child)) {
          return React.cloneElement(child as React.ReactElement<{ open?: boolean; onOpenChange?: (open: boolean) => void }>, {
            open,
            onOpenChange,
          })
        }
        return child
      })}
    </div>
  )
}

function SheetTrigger({
  children,
  ...props
}: React.ComponentProps<"button">) {
  return (
    <button data-slot="sheet-trigger" {...props}>
      {children}
    </button>
  )
}

function SheetClose({
  children,
  ...props
}: React.ComponentProps<"button">) {
  return (
    <button data-slot="sheet-close" {...props}>
      {children}
    </button>
  )
}

interface SheetContentProps extends React.ComponentProps<"div"> {
  side?: "top" | "right" | "bottom" | "left"
  showCloseButton?: boolean
  open?: boolean
  onOpenChange?: (open: boolean) => void
}

function SheetContent({
  className,
  children,
  side = "right",
  showCloseButton = true,
  open,
  onOpenChange,
  ...props
}: SheetContentProps) {
  if (!open) return null

  const sideClasses = {
    top: "inset-x-0 top-0 border-b translate-y-0",
    right: "inset-y-0 right-0 h-full w-3/4 border-l translate-x-0",
    bottom: "inset-x-0 bottom-0 border-t translate-y-0",
    left: "inset-y-0 left-0 h-full w-3/4 border-r -translate-x-0",
  }

  return (
    <div
      className="fixed inset-0 z-50 bg-black/10"
      onClick={() => onOpenChange?.(false)}
    >
      <div
        data-slot="sheet-content"
        data-side={side}
        className={cn(
          "fixed z-50 flex flex-col gap-4 bg-popover bg-clip-padding text-sm text-popover-foreground shadow-lg",
          sideClasses[side],
          className
        )}
        onClick={(e) => e.stopPropagation()}
        {...props}
      >
        {children}
        {showCloseButton && (
          <Button
            variant="ghost"
            className="absolute top-3 right-3"
            size="icon-sm"
            onClick={() => onOpenChange?.(false)}
          >
            <XIcon />
            <span className="sr-only">Close</span>
          </Button>
        )}
      </div>
    </div>
  )
}

function SheetHeader({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="sheet-header"
      className={cn("flex flex-col gap-0.5 p-4", className)}
      {...props}
    />
  )
}

function SheetFooter({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="sheet-footer"
      className={cn("mt-auto flex flex-col gap-2 p-4", className)}
      {...props}
    />
  )
}

function SheetTitle({
  className,
  ...props
}: React.ComponentProps<"h2">) {
  return (
    <h2
      data-slot="sheet-title"
      className={cn(
        "font-heading text-base font-medium text-foreground",
        className
      )}
      {...props}
    />
  )
}

function SheetDescription({
  className,
  ...props
}: React.ComponentProps<"p">) {
  return (
    <p
      data-slot="sheet-description"
      className={cn("text-sm text-muted-foreground", className)}
      {...props}
    />
  )
}

export {
  Sheet,
  SheetTrigger,
  SheetClose,
  SheetContent,
  SheetHeader,
  SheetFooter,
  SheetTitle,
  SheetDescription,
}