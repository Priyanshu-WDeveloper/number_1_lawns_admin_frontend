import { useState, useId } from 'react';
import { Check, ChevronsUpDown } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';

export interface ComboboxOption {
  value: string;
  label: string;
  icon?: React.ReactNode;
}

interface ComboboxProps {
  options: ComboboxOption[];
  value: string;
  onValueChange: (value: string) => void;
  placeholder?: string;
  searchPlaceholder?: string;
  emptyText?: string;
  error?: string;
  disabled?: boolean;
  className?: string;
}

export function Combobox({
  options,
  value,
  onValueChange,
  placeholder = 'Select...',
  searchPlaceholder = 'Search...',
  emptyText = 'No results found.',
  error,
  disabled,
  className,
}: ComboboxProps) {
  const [open, setOpen] = useState(false);
  const listId = useId();
  const selectedOption = options.find((o) => o.value === value);

  return (
    // <div className="space-y-1">
    <div className="w-full min-w-0 space-y-1">
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            role="combobox"
            aria-expanded={open}
            aria-controls={listId}
            disabled={disabled}
            className={cn(
              'h-12 w-full justify-between rounded-xl border bg-background px-3 text-sm font-normal hover:bg-background',
              error ? 'border-red-500' : 'border-border',
              !selectedOption && 'text-muted-foreground',
              className,
            )}
          >
            {selectedOption ? (
              // <span className="flex items-center gap-2">
              <span className="flex min-w-0 items-center gap-2 overflow-hidden">
                {selectedOption.icon}
                {/* <span>{selectedOption.label}</span> */}
                <span className="truncate">
                  {selectedOption.label}
                </span>
              </span>
            ) : (
              placeholder
            )}
            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 text-muted-foreground" />
          </Button>
        </PopoverTrigger>
        {/* <PopoverContent
        className="w-[--radix-popover-trigger-width] p-0" */}
        <PopoverContent
          className="w-[var(--radix-popover-trigger-width)] min-w-full p-0"
          align="start"
        >
          <Command>
            <CommandInput placeholder={searchPlaceholder} />
            <CommandList id={listId}>
              <CommandEmpty>{emptyText}</CommandEmpty>
              <CommandGroup>
                {options.map((option) => (
                  <CommandItem
                    key={option.value}
                    onSelect={() => {
                      onValueChange(
                        option.value === value ? '' : option.value,
                      );
                      setOpen(false);
                    }}
                  >
                    <span className="flex items-center gap-2">
                      {option.icon}
                      <span>{option.label}</span>
                    </span>
                    <Check
                      className={cn(
                        'ml-auto h-4 w-4',
                        value === option.value
                          ? 'text-primary opacity-100'
                          : 'opacity-0',
                      )}
                    />
                  </CommandItem>
                ))}
              </CommandGroup>
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>
      {error && <p className="text-sm text-red-500">{error}</p>}
    </div>
  );
}
