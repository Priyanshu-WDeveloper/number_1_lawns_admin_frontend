import * as React from "react"
import { cn } from "@/lib/utils"
import { ChevronDownIcon, CheckIcon } from "lucide-react"

interface SelectContextValue {
  value: string
  onValueChange: (value: string) => void
  open: boolean
  setOpen: (open: boolean) => void
}

const SelectContext = React.createContext<SelectContextValue | null>(null)

function useSelectContext() {
  const context = React.useContext(SelectContext)
  if (!context) {
    throw new Error("Select components must be used within a Select")
  }
  return context
}

interface SelectProps {
  value?: string
  defaultValue?: string
  onValueChange?: (value: string) => void
  children?: React.ReactNode
}

function Select({ value, defaultValue, onValueChange, children }: SelectProps) {
  const [internalValue, setInternalValue] = React.useState(defaultValue || "")
  const [open, setOpen] = React.useState(false)

  const currentValue = value !== undefined ? value : internalValue

  const handleValueChange = (newValue: string) => {
    if (value === undefined) {
      setInternalValue(newValue)
    }
    onValueChange?.(newValue)
    setOpen(false)
  }

  return (
    <SelectContext.Provider
      value={{
        value: currentValue,
        onValueChange: handleValueChange,
        open,
        setOpen,
      }}
    >
      <div className="relative">{children}</div>
    </SelectContext.Provider>
  )
}

function SelectGroup({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="select-group"
      className={cn("scroll-my-1 p-1", className)}
      {...props}
    />
  )
}

function SelectValue({ placeholder, ...props }: React.ComponentProps<"span"> & { placeholder?: string }) {
  const { value } = useSelectContext()
  return (
    <span data-slot="select-value" {...props}>
      {value || placeholder}
    </span>
  )
}

interface SelectTriggerProps extends React.ComponentProps<"button"> {
  size?: "sm" | "default"
}

function SelectTrigger({ className, size = "default", children, ...props }: SelectTriggerProps) {
  const { open, setOpen } = useSelectContext()

  return (
    <button
      data-slot="select-trigger"
      data-size={size}
      type="button"
      className={cn(
        "flex w-fit items-center justify-between gap-1.5 rounded-lg border border-input bg-transparent py-2 pr-2 pl-2.5 text-sm whitespace-nowrap transition-colors outline-none select-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 disabled:cursor-not-allowed disabled:opacity-50 data-placeholder:text-muted-foreground data-[size=default]:h-8 data-[size=sm]:h-7",
        className
      )}
      onClick={() => setOpen(!open)}
      {...props}
    >
      {children}
      <ChevronDownIcon className="pointer-events-none size-4 text-muted-foreground" />
    </button>
  )
}

interface SelectContentProps extends React.ComponentProps<"div"> {
  position?: "item-aligned" | "popper"
}

function SelectContent({ className, children, position = "item-aligned", ...props }: SelectContentProps) {
  const { open, setOpen } = useSelectContext()

  if (!open) return null

  return (
    <div
      data-slot="select-content"
      className={cn(
        "absolute top-full left-0 z-50 mt-1 min-w-36 overflow-hidden rounded-lg bg-popover text-popover-foreground shadow-md",
        className
      )}
      {...props}
    >
      <div
        className="max-h-96 overflow-y-auto"
        onClick={() => setOpen(false)}
      >
        {children}
      </div>
    </div>
  )
}

function SelectLabel({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="select-label"
      className={cn("px-1.5 py-1 text-xs text-muted-foreground", className)}
      {...props}
    />
  )
}

interface SelectItemProps extends React.ComponentProps<"div"> {
  value: string
}

function SelectItem({ className, children, value, ...props }: SelectItemProps) {
  const { value: selectedValue, onValueChange } = useSelectContext()
  const isSelected = selectedValue === value

  return (
    <div
      data-slot="select-item"
      className={cn(
        "relative flex w-full cursor-pointer items-center gap-1.5 rounded-md py-1.5 pr-8 pl-2.5 text-sm outline-none select-none data-[selected]:bg-accent",
        className
      )}
      onClick={() => onValueChange(value)}
      {...props}
    >
      {isSelected && (
        <span className="pointer-events-none absolute right-2 flex size-4 items-center justify-center">
          <CheckIcon className="pointer-events-none size-4" />
        </span>
      )}
      <span>{children}</span>
    </div>
  )
}

function SelectSeparator({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="select-separator"
      className={cn("pointer-events-none -mx-1 my-1 h-px bg-border", className)}
      {...props}
    />
  )
}

export {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectSeparator,
  SelectTrigger,
  SelectValue,
}