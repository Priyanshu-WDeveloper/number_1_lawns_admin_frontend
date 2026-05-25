import * as React from "react"
import { Check, ChevronsUpDown, Loader2 } from "lucide-react"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command"

interface SearchableItem {
  _id: string
  label: string
  subtitle?: string
}

interface SearchableSelectProps {
  data: SearchableItem[]
  value: string
  onChange: (value: string) => void
  placeholder?: string
  searchPlaceholder?: string
  loading?: boolean
  emptyMessage?: string
  notFoundMessage?: string
  disabled?: boolean
  error?: string
}

export function SearchableSelect({
  data,
  value,
  onChange,
  placeholder = "Select...",
  searchPlaceholder = "Search...",
  loading = false,
  emptyMessage = "No items found.",
  notFoundMessage = "No results found.",
  disabled = false,
  error,
}: SearchableSelectProps) {
  const [open, setOpen] = React.useState(false)

  const selectedItem = React.useMemo(
    () => data.find((item) => item._id === value),
    [data, value],
  )

  return (
    <div className="space-y-1">
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            role="combobox"
            aria-expanded={open}
            disabled={disabled}
            className={cn(
              "h-12 w-full justify-between rounded-xl border-[#e5e5e5] bg-[#fafaf8] px-4 text-sm font-normal hover:bg-[#fafaf8] focus-visible:ring-2 focus-visible:ring-[#16610E] focus-visible:ring-offset-2",
              !selectedItem && "text-[#9ca3af]",
              error && "border-red-500",
            )}
          >
            {loading ? (
              <span className="flex items-center gap-2 text-[#9ca3af]">
                <Loader2 className="h-4 w-4 animate-spin" />
                Loading...
              </span>
            ) : selectedItem ? (
              <div className="flex flex-col items-start">
                <span>{selectedItem.label}</span>
                {selectedItem.subtitle && (
                  <span className="text-xs text-[#9ca3af]">
                    {selectedItem.subtitle}
                  </span>
                )}
              </div>
            ) : (
              placeholder
            )}
            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 text-[#9ca3af]" />
          </Button>
        </PopoverTrigger>
        <PopoverContent
          className="w-[--radix-popover-trigger-width] p-0"
          align="start"
        >
          <Command>
            <CommandInput placeholder={searchPlaceholder} />
            <CommandList>
              <CommandEmpty>{notFoundMessage}</CommandEmpty>
              {data.length === 0 && !loading ? (
                <div className="py-6 text-center text-sm text-[#9ca3af]">
                  {emptyMessage}
                </div>
              ) : (
                <CommandGroup>
                  {data.map((item) => (
                    <CommandItem
                      key={item._id}
                      value={item._id}
                      onSelect={(currentValue: string) => {
                        onChange(currentValue === value ? "" : currentValue)
                        setOpen(false)
                      }}
                    >
                      <div className="flex flex-1 flex-col">
                        <span>{item.label}</span>
                        {item.subtitle && (
                          <span className="text-xs text-[#9ca3af]">
                            {item.subtitle}
                          </span>
                        )}
                      </div>
                      <Check
                        className={cn(
                          "ml-auto h-4 w-4",
                          value === item._id
                            ? "text-[#16610E] opacity-100"
                            : "opacity-0",
                        )}
                      />
                    </CommandItem>
                  ))}
                </CommandGroup>
              )}
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>
      {error && <p className="text-sm text-red-500">{error}</p>}
    </div>
  )
}
