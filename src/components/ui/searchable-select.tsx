import * as React from 'react';
import { Check, ChevronsUpDown, Loader2 } from 'lucide-react';

import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Sheet, SheetContent } from '@/components/ui/sheet';

import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command';
import { AssignAvatarCell } from '@/components/admin/assign-avatar-cell';
import { useIsMobile } from '@/hooks/use-mobile';

interface SearchableItem {
  _id: string;
  label: string;
  subtitle?: string;
  countryCode?: string;
  phoneNumber?: string;
  profileImage?: string;
  address?: string;
  customerId?: string;
  employeeId?: string;
}

interface SearchableSelectProps {
  data: SearchableItem[];
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  searchPlaceholder?: string;
  loading?: boolean;
  emptyMessage?: string;
  notFoundMessage?: string;
  disabled?: boolean;
  error?: string;
  variant?: 'popover' | 'responsive';
  onSearch?: (query: string) => void;
}

export function SearchableSelect({
  data,
  value,
  onChange,
  placeholder = 'Select...',
  searchPlaceholder = 'Search...',
  loading = false,
  emptyMessage = 'No items found.',
  notFoundMessage = 'No results found.',
  disabled = false,
  error,
  variant = 'popover',
  onSearch,
}: SearchableSelectProps) {
  const [open, setOpen] = React.useState(false);
  const isMobile = useIsMobile();

  const selectedItem = React.useMemo(
    () => data.find((item) => item._id === value),
    [data, value],
  );

  const triggerButton = (onClick?: () => void) => (
    <Button
      variant="outline"
      type="button"
      role="combobox"
      aria-expanded={open}
      disabled={disabled}
      onClick={onClick}
      className={cn(
        'h-12 w-full justify-between rounded-xl border-border bg-background px-4 text-sm font-normal hover:bg-background focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
        !selectedItem && 'text-muted-foreground',
        error && 'border-red-500',
      )}
    >
      {loading ? (
        <span className="flex items-center gap-2 text-muted-foreground">
          <Loader2 className="h-4 w-4 animate-spin" />
          Loading...
        </span>
      ) : selectedItem ? (
        <div className="flex flex-col items-start">
          <span>{selectedItem.label}</span>
          {selectedItem.subtitle && (
            <span className="text-xs text-muted-foreground">
              {selectedItem.subtitle}
            </span>
          )}
        </div>
      ) : (
        placeholder
      )}
      <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 text-muted-foreground" />
    </Button>
  );

  const listContent = (
    commandClassName?: string,
    commandListClassName?: string,
  ) => (
    <Command className={commandClassName} shouldFilter={!onSearch}>
      <CommandInput
        placeholder={searchPlaceholder}
        onValueChange={onSearch}
      />
      <CommandList className={commandListClassName}>
        <CommandEmpty>{notFoundMessage}</CommandEmpty>
        {data.length === 0 && !loading ? (
          <div className="py-6 text-center text-sm text-muted-foreground">
            {emptyMessage}
          </div>
        ) : (
          <CommandGroup>
            {data.map((item) => (
              <CommandItem
                key={item._id}
                value={item._id}
                onSelect={(currentValue: string) => {
                  onChange(
                    currentValue === value ? '' : currentValue,
                  );
                  setOpen(false);
                }}
              >
                <div className="flex flex-1 flex-col">
                  <AssignAvatarCell
                    name={item.label}
                    email={item.subtitle}
                    profileImage={item.profileImage}
                    countryCode={item.countryCode}
                    phoneNumber={item.phoneNumber}
                    address={item.address}
                    customId={item.customerId || item.employeeId}
                  />
                </div>
                <Check
                  className={cn(
                    'ml-auto h-4 w-4',
                    value === item._id
                      ? 'text-primary opacity-100'
                      : 'opacity-0',
                  )}
                />
              </CommandItem>
            ))}
          </CommandGroup>
        )}
      </CommandList>
    </Command>
  );

  return (
    <div className="space-y-1">
      {variant === 'responsive' ? (
        <>
          {!isMobile ? (
            <Popover open={open} onOpenChange={setOpen}>
              <PopoverTrigger asChild>
                {triggerButton()}
              </PopoverTrigger>
              <PopoverContent
                className="p-0"
                align="start"
                style={{
                  width: 'var(--radix-popover-trigger-width)',
                  minWidth: '500px',
                }}
              >
                {listContent()}
              </PopoverContent>
            </Popover>
          ) : (
            <>
              {triggerButton(() => setOpen(true))}
              <Sheet open={open} onOpenChange={setOpen}>
                <SheetContent
                  side="bottom"
                  className="h-[70vh] rounded-t-4xl border-x border-border p-0 gap-0 flex flex-col"
                  showCloseButton={false}
                >
                  <div className="p-4 border-b shrink-0">
                    <h2 className="text-lg font-semibold">
                      {placeholder}
                    </h2>
                  </div>
                  <div className="flex-1 flex flex-col overflow-hidden">
                    {listContent(
                      'flex-1',
                      'flex-1 overflow-y-auto max-h-none',
                    )}
                  </div>
                </SheetContent>
              </Sheet>
            </>
          )}
          {error && <p className="text-sm text-red-500">{error}</p>}
        </>
      ) : (
        <>
          <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>{triggerButton()}</PopoverTrigger>
            <PopoverContent
              className="p-0"
              align="start"
              style={{
                width: 'var(--radix-popover-trigger-width)',
                minWidth: '500px',
              }}
            >
              {listContent()}
            </PopoverContent>
          </Popover>
          {error && <p className="text-sm text-red-500">{error}</p>}
        </>
      )}
    </div>
  );
}
