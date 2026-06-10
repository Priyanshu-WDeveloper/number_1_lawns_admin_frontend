import * as React from 'react';
import {
  Search,
  Plus,
  ChevronLeft,
  ChevronRight,
  ChevronsUpDown,
  X,
} from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type DataTableData = Record<string, any>;

export interface ColumnDef<T extends DataTableData> {
  accessorKey: string;
  header: string;
  cell?: (row: T) => React.ReactNode;
  skeleton?: () => React.ReactNode;
  filterField?: string;
  filterOptions?: string[];
  sortable?: boolean;
}

interface DataTableProps<T extends DataTableData> {
  data: T[];
  columns: ColumnDef<T>[];
  addButtonLabel?: string;
  onAddClick?: () => void;
  searchPlaceholder?: string;
  filterField?: string;
  filterOptions?: string[];
  customFilterFn?: (
    row: T,
    searchTerm: string,
    filterValue: string,
  ) => boolean;
  loading?: boolean;
  pagination?: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
  onPageChange?: (page: number) => void;
  // Controlled mode for server-side filtering
  searchValue?: string;
  onSearchChange?: (value: string) => void;
  filterValue?: string;
  onFilterChange?: (value: string) => void;
  serverSideFiltering?: boolean;
  showAllOption?: boolean;
  // Server-side sorting
  sortValue?: string;
  onSortChange?: (sort: string) => void;
  serverSideSorting?: boolean;
  // Consumer-facing props (unused by component but accepted for compatibility)
  title?: string;
  description?: string;
  defaultLimit?: number;
  onLimitChange?: (limit: number) => void;
}

// interface ActionButtonProps extends React.ComponentProps<
//   typeof Button
// > {
//   icon: React.ReactNode;
//   onClick?: () => void;
//   variant?: 'outline' | 'default';
//   intent?: 'default' | 'view' | 'edit' | 'delete';
//   className?: string;
// }

// export function ActionButton({
//   icon,
//   onClick,
//   variant = 'outline',
//   intent = 'default',
//   className = '',
// }: ActionButtonProps) {
//   const intentStyles: Record<string, string> = {
//     default: 'hover:bg-muted',
//     view: 'border-blue-100 bg-blue-50/60 text-blue-500 hover:border-blue-500 hover:bg-blue-600 hover:text-white hover:shadow-blue-200',
//     edit: 'border-amber-100 bg-amber-50/60 text-amber-500 hover:border-amber-500 hover:bg-amber-500 hover:text-white hover:shadow-amber-200',
//     delete:
//       'border-red-100 bg-red-50/60 text-red-500 hover:border-red-500 hover:bg-red-600 hover:text-white hover:shadow-red-200',
//   };

//   return (
//     <Button
//       variant={variant}
//       size="icon-sm"
//       onClick={onClick}
//       className={cn(
//         'group h-9 w-9 rounded-full border transition-all duration-200 hover:scale-105 hover:shadow-lg active:scale-95',
//         intentStyles[intent],
//         className,
//       )}
//     >
//       <span className="transition-transform duration-200 group-hover:rotate-6 group-hover:scale-110">
//         {icon}
//       </span>
//     </Button>
//   );
// }

interface ActionButtonProps extends React.ComponentProps<
  typeof Button
> {
  icon: React.ReactNode;

  intent?: 'default' | 'view' | 'edit' | 'delete';
}

export const ActionButton = React.forwardRef<
  HTMLButtonElement,
  ActionButtonProps
>(({ icon, intent = 'default', className, ...props }, ref) => {
  const intentStyles = {
    default:
      'border-border bg-background text-muted-foreground hover:bg-muted hover:text-foreground',

    view: 'border-blue-100 bg-blue-50/60 text-blue-500 hover:border-blue-500 hover:bg-blue-600 hover:text-white hover:shadow-blue-200',

    edit: 'border-amber-100 bg-amber-50/60 text-amber-500 hover:border-amber-500 hover:bg-amber-500 hover:text-white hover:shadow-amber-200',

    delete:
      'border-red-100 bg-red-50/60 text-red-500 hover:border-red-500 hover:bg-red-600 hover:text-white hover:shadow-red-200',
  };

  return (
    <Button
      ref={ref}
      variant="outline"
      size="icon-sm"
      className={cn(
        `
            group
            h-9
            w-9
            rounded-full
            border
            transition-all
            duration-200

            hover:scale-105
            hover:shadow-lg

            active:scale-95

            focus-visible:outline-none
            focus-visible:ring-2
            focus-visible:ring-ring
            `,
        intentStyles[intent],
        className,
      )}
      {...props}
    >
      <span
        className="
            transition-transform
            duration-200
            group-hover:rotate-6
            group-hover:scale-110
          "
      >
        {icon}
      </span>
    </Button>
  );
});

ActionButton.displayName = 'ActionButton';

interface PaginationButtonProps {
  label?: string;
  icon?: React.ReactNode;
  active?: boolean;
  onClick?: () => void;
}

export function PaginationButton({
  label,
  icon,
  active,
  onClick,
}: PaginationButtonProps) {
  return (
    <Button
      variant={active ? 'default' : 'outline'}
      size="icon"
      className={`h-8 w-8 rounded-lg text-sm ${active ? 'border-primary bg-primary/10 text-primary' : 'border-border bg-background text-muted-foreground hover:bg-muted'}`}
      onClick={onClick}
    >
      {icon || label}
    </Button>
  );
}

const getVisiblePages = (
  current: number,
  total: number,
): (number | string)[] => {
  if (total <= 7)
    return Array.from({ length: total }, (_, i) => i + 1);
  if (current <= 3) return [1, 2, 3, 4, '...', total];
  if (current >= total - 2)
    return [1, '...', total - 3, total - 2, total - 1, total];
  return [1, '...', current - 1, current, current + 1, '...', total];
};

export default function DataTable<T extends DataTableData>({
  data,
  columns,
  addButtonLabel = 'Add Item',
  onAddClick,
  searchPlaceholder = 'Search...',
  filterField,
  filterOptions,
  customFilterFn,
  loading = false,
  pagination,
  onPageChange,
  // Controlled mode props
  searchValue,
  onSearchChange,
  filterValue: filterValueProp,
  onFilterChange,
  serverSideFiltering = false,
  showAllOption = true,
  // Unused props (kept for consumer compatibility)
  title: _title,
  description: _description,
  defaultLimit: _defaultLimit,
  onLimitChange: _onLimitChange,
  // Sorting props (unused - kept for future use)
  // sortValue,
  // onSortChange,
  // serverSideSorting = false,
}: DataTableProps<T>) {
  // Internal state (used when not in controlled mode)
  const [internalSearch, setInternalSearch] = React.useState('');
  const [internalFilter, setInternalFilter] =
    React.useState<string>('All');
  // const [internalSort, setInternalSort] = React.useState<string>('');

  // Use controlled props if provided, otherwise internal state
  const search = searchValue ?? internalSearch;
  const filterValue = filterValueProp ?? internalFilter;
  // const sort = sortValue ?? internalSort;

  const setSearch = onSearchChange ?? setInternalSearch;
  const setFilterValue = onFilterChange ?? setInternalFilter;
  // const setSort = onSortChange ?? setInternalSort;

  const handleFilterChange = (value: string) => {
    setFilterValue(value);
  };

  // Unused sort handler - kept for future use
  // const _handleSort = (column: ColumnDef<T>) => {
  //   if (!serverSideSorting || column.sortable === false) return;
  //   const accessor = column.accessorKey;
  //   const currentSort = sort;
  //   if (currentSort === accessor) {
  //     setSort(`${accessor}_desc`);
  //   } else if (currentSort === `${accessor}_desc`) {
  //     setSort('');
  //   } else {
  //     setSort(accessor);
  //   }
  // };

  const filteredData = React.useMemo(() => {
    if (serverSideFiltering) return data; // Server handles filtering

    return data.filter((row) => {
      const matchesSearch =
        !search ||
        columns.some((col) => {
          const value = row[col.accessorKey];
          if (typeof value === 'string') {
            return value.toLowerCase().includes(search.toLowerCase());
          }
          if (typeof value === 'number') {
            return String(value).includes(search);
          }
          return false;
        });

      const matchesFilter =
        !filterField ||
        !filterValue ||
        filterValue === 'All' ||
        (filterField in row &&
          row[filterField]?.toLowerCase() ===
            filterValue?.toLowerCase());

      if (customFilterFn) {
        return customFilterFn(row, search, filterValue);
      }

      return matchesSearch && matchesFilter;
    });
  }, [
    data,
    search,
    filterValue,
    filterField,
    columns,
    customFilterFn,
    serverSideFiltering,
  ]);

  const renderCell = (row: T, column: ColumnDef<T>) => {
    if (column.cell) {
      return column.cell(row);
    }
    const value = row[column.accessorKey];
    if (value === undefined || value === null) {
      return '-';
    }

    if (typeof value === 'number') {
      return value;
    }

    if (typeof value === 'object') {
      return String(value);
    }

    return String(value);
  };

  const getSkeletonForColumn = (column: ColumnDef<T>) => {
    if (column.skeleton) return column.skeleton();

    const key = column.accessorKey.toLowerCase();

    if (key.includes('name') || key.includes('fullname')) {
      return (
        <div className="flex items-center gap-3">
          <Skeleton className="h-7 w-7 rounded-full" />
          <div className="flex flex-col gap-1.5">
            <Skeleton className="h-4 w-32" />
            <Skeleton className="h-3 w-48" />
          </div>
        </div>
      );
    }
    if (key.includes('status')) {
      return (
        <div className="inline-flex items-center gap-1.5">
          <Skeleton className="h-2 w-2 rounded-full" />
          <Skeleton className="h-4 w-16" />
        </div>
      );
    }
    if (key.includes('action')) {
      return (
        <div className="flex items-center gap-1">
          <Skeleton className="h-8 w-8 rounded-full" />
          <Skeleton className="h-8 w-8 rounded-full" />
          <Skeleton className="h-8 w-8 rounded-full" />
        </div>
      );
    }
    if (key.includes('email')) {
      return <Skeleton className="h-4 w-48" />;
    }
    if (key.includes('phone')) {
      return <Skeleton className="h-4 w-24" />;
    }
    if (
      key.includes('createdat') ||
      key.includes('updatedat') ||
      key.includes('date') ||
      key.includes('joined')
    ) {
      return <Skeleton className="h-4 w-24" />;
    }
    if (
      key.includes('adminid') ||
      key.includes('invoicenumber') ||
      key === 'id'
    ) {
      return <Skeleton className="h-4 w-16" />;
    }
    if (
      key.includes('address') ||
      key.includes('city') ||
      key.includes('state') ||
      key.includes('country')
    ) {
      return <Skeleton className="h-4 w-40" />;
    }
    if (
      key.includes('role') ||
      key.includes('department') ||
      key.includes('jobtype') ||
      key.includes('paymenttype')
    ) {
      return <Skeleton className="h-4 w-24" />;
    }

    return <Skeleton className="h-4 w-28" />;
  };

  const renderSkeletonRow = () => (
    <tr className="border-b border-border">
      {columns.map((column) => (
        <td key={column.accessorKey} className="px-4 py-2.5">
          {getSkeletonForColumn(column)}
        </td>
      ))}
    </tr>
  );

  return (
    <Card className="rounded-2xl w-full bg-white shadow-sm flex flex-col flex-1 pb-1 pt-3 mb-1">
      <CardContent className="px-6 flex-1 flex flex-col  ">
        {/* Filter Row */}
        <div className="flex items-center justify-between gap-3 mb-3 flex-wrap">
          <div className="relative flex-1 max-w-md max-sm:max-w-none min-w-[260px]">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder={searchPlaceholder}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-8 sm:pl-10 pr-6 sm:pr-12 text-xs sm:text-sm rounded-xl border-border bg-background h-10"
            />
            {search && (
              <button
                type="button"
                onClick={() => setSearch('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 h-5 w-5 flex items-center justify-center rounded-full text-muted-foreground hover:text-muted-foreground hover:bg-muted transition-colors"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            )}
          </div>

          <div className="flex items-center gap-2 shrink-0">
            {filterField && filterOptions && (
              <Select
                value={filterValue}
                onValueChange={handleFilterChange}
              >
                <SelectTrigger className="w-[120px] sm:w-[140px] rounded-xl h-10 border-border">
                  <SelectValue
                    placeholder={`${showAllOption ? 'All' : 'Select'} ${filterField}`}
                  />
                </SelectTrigger>
                <SelectContent>
                  {showAllOption && (
                    <SelectItem value="All">All</SelectItem>
                  )}
                  {filterOptions.map((option) => (
                    <SelectItem
                      key={option}
                      value={option.toLowerCase()}
                    >
                      {option}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}

            {addButtonLabel && onAddClick && (
              <Button
                className="h-10 rounded-xl bg-green-600 text-white hover:bg-green-700 px-3 sm:px-5"
                onClick={onAddClick}
              >
                <Plus className="h-4 w-4 sm:mr-2" />
                <span className="hidden sm:inline">
                  {addButtonLabel}
                </span>
              </Button>
            )}
          </div>
        </div>

        {/* Table */}
        {/* <div className="rounded-xl border border-border overflow-auto flex-1 min-h-0"> */}
        {/* <div className="rounded-xl border border-border flex-1 min-h-0"> */}
        <div className="rounded-xl border border-border flex-1 min-h-0 overflow-auto">
          <table className="w-full min-w-[900px]">
            <thead className="bg-muted">
              <tr className="border-b border-border">
                {columns.map((column) => (
                  <th
                    key={column.accessorKey}
                    className="px-4 py-2.5 text-[12px] font-medium text-muted-foreground uppercase tracking-wider text-left whitespace-nowrap"
                  >
                    <div className="flex items-center gap-1">
                      {column.header}
                      {column.sortable !== false && (
                        <ChevronsUpDown className="h-3 w-3 text-muted-foreground" />
                      )}
                    </div>
                  </th>
                ))}
              </tr>
            </thead>

            <tbody>
              {loading ? (
                Array.from({ length: 8 }).map((_, i) => (
                  <React.Fragment key={i}>
                    {renderSkeletonRow()}
                  </React.Fragment>
                ))
              ) : filteredData.length > 0 ? (
                filteredData.map((row: T) => (
                  <tr
                    key={row._id}
                    className="border-b border-border transition-colors hover:bg-muted last:border-b-0"
                  >
                    {columns.map((column) => (
                      <td
                        key={column.accessorKey}
                        className="px-4 py-2.5 text-sm text-foreground whitespace-nowrap"
                      >
                        {renderCell(row, column)}
                      </td>
                    ))}
                  </tr>
                ))
              ) : (
                <tr>
                  <td
                    colSpan={columns.length}
                    className="h-[240px] text-center"
                  >
                    <div className="flex flex-col items-center justify-center gap-2">
                      <p className="text-lg font-medium text-muted-foreground">
                        No matching results
                      </p>
                      <p className="text-sm text-muted-foreground">
                        Try adjusting your search or filters
                      </p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {pagination && pagination.totalPages > 1 && (
          <div className="flex items-center justify-end gap-3 px-6 pt-2  pb-0  border-border">
            <p className="text-[13px] text-muted-foreground whitespace-nowrap">
              {pagination.total} results
            </p>

            <div className="flex items-center gap-1">
              <Button
                variant="outline"
                size="icon"
                className="h-8 w-8 rounded-lg border-border text-muted-foreground"
                disabled={pagination.page === 1}
                onClick={() => onPageChange?.(pagination.page - 1)}
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>

              {getVisiblePages(
                pagination.page,
                pagination.totalPages,
              ).map((p, i) =>
                p === '...' ? (
                  <span
                    key={`ellipsis-${i}`}
                    className="px-2 text-muted-foreground"
                  >
                    ...
                  </span>
                ) : (
                  <PaginationButton
                    key={p}
                    label={String(p)}
                    active={p === pagination.page}
                    onClick={() => onPageChange?.(p as number)}
                  />
                ),
              )}

              <Button
                variant="outline"
                size="icon"
                className="h-8 w-8 rounded-lg border-border text-muted-foreground"
                disabled={pagination.page === pagination.totalPages}
                onClick={() => onPageChange?.(pagination.page + 1)}
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
