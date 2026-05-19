import * as React from 'react';
import {
  Search,
  Plus,
  ChevronLeft,
  ChevronRight,
  ChevronsUpDown,
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

export type DataTableData = Record<string, any>;

export interface ColumnDef<T extends DataTableData> {
  accessorKey: string;
  header: string;
  cell?: (row: T) => React.ReactNode;
  filterField?: string;
  filterOptions?: string[];
  sortable?: boolean;
}

interface DataTableProps<T extends DataTableData> {
  data: T[];
  columns: ColumnDef<T>[];
  title: string;
  description: string;
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
  onLimitChange?: (limit: number) => void;
}

interface ActionButtonProps extends React.ComponentProps<
  typeof Button
> {
  icon: React.ReactNode;
  onClick?: () => void;
  variant?: 'outline' | 'default';
  intent?: 'default' | 'view' | 'edit' | 'delete';
  className?: string;
}

export function ActionButton({
  icon,
  onClick,
  variant = 'outline',
  intent = 'default',
  className = '',
}: ActionButtonProps) {
  const intentStyles: Record<string, string> = {
    default: 'hover:bg-muted',
    view: 'border-blue-100 bg-blue-50/60 text-blue-500 hover:border-blue-500 hover:bg-blue-600 hover:text-white hover:shadow-blue-200',
    edit: 'border-amber-100 bg-amber-50/60 text-amber-500 hover:border-amber-500 hover:bg-amber-500 hover:text-white hover:shadow-amber-200',
    delete:
      'border-red-100 bg-red-50/60 text-red-500 hover:border-red-500 hover:bg-red-600 hover:text-white hover:shadow-red-200',
  };

  return (
    <Button
      variant={variant}
      size="icon-sm"
      onClick={onClick}
      className={cn(
        'group h-9 w-9 rounded-full border transition-all duration-200 hover:scale-105 hover:shadow-lg active:scale-95',
        intentStyles[intent],
        className,
      )}
    >
      <span className="transition-transform duration-200 group-hover:rotate-6 group-hover:scale-110">
        {icon}
      </span>
    </Button>
  );
}

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
      className={`h-8 w-8 rounded-lg text-sm ${active ? 'border-[#16610E] bg-[#edf8e7] text-[#16610E]' : 'border-[#e5e7eb] bg-white text-[#6b7280] hover:bg-[#f9fafb]'}`}
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
  title: _title,
  description: _description,
  addButtonLabel = 'Add Item',
  onAddClick,
  searchPlaceholder = 'Search...',
  filterField,
  filterOptions,
  customFilterFn,
  loading = false,
  pagination,
  onPageChange,
  onLimitChange: _onLimitChange,
}: DataTableProps<T>) {
  const [search, setSearch] = React.useState('');
  const [filterValue, setFilterValue] = React.useState<string>('All');

  const handleFilterChange = (value: string) => {
    setFilterValue(value);
  };

  const filteredData = React.useMemo(() => {
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

    return String(value);
  };

  const renderSkeletonRow = () => (
    <tr className="border-b border-[#f3f4f6]">
      {columns.map((column, i) => (
        <td key={column.accessorKey} className="px-4 py-2.5">
          <Skeleton
            className={cn(
              'h-4',
              i === 0 && 'w-16',
              i === columns.length - 1 && 'w-24',
              i !== 0 && i !== columns.length - 1 && 'w-28',
            )}
          />
        </td>
      ))}
    </tr>
  );

  return (
    <Card className="rounded-2xl w-full bg-white shadow-sm flex flex-col h-full">
      <CardContent className="px-6 flex-1 flex flex-col ">
        {/* Filter Row */}
        <div className="flex items-center justify-between gap-3 mb-3">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#9ca3af]" />
            <Input
              placeholder={searchPlaceholder}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10 pr-12 rounded-xl border-[#e5e7eb] bg-white h-10"
            />
            <kbd className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] font-mono text-[#9ca3af] bg-[#f3f4f6] rounded px-1.5 py-0.5 pointer-events-none border border-[#e5e7eb]">
              ⌘K
            </kbd>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            {filterField && filterOptions && (
              <Select
                value={filterValue}
                onValueChange={handleFilterChange}
              >
                <SelectTrigger className="w-[140px] rounded-xl h-10 border-[#e5e7eb]">
                  <SelectValue placeholder={`All ${filterField}`} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="All">All</SelectItem>
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
                className="h-10 rounded-xl bg-[#16610E] text-white hover:bg-[#1a7a12] px-5"
                onClick={onAddClick}
              >
                <Plus className="h-4 w-4 mr-2" />
                {addButtonLabel}
              </Button>
            )}
          </div>
        </div>

        {/* Table */}
        <div className="rounded-xl border border-[#f3f4f6] overflow-auto flex-1 min-h-0">
          <table className="w-full min-w-[900px]">
            <thead className="bg-[#f9fafb]">
              <tr className="border-b border-[#f3f4f6]">
                {columns.map((column) => (
                  <th
                    key={column.accessorKey}
                    className="px-4 py-2.5 text-[12px] font-medium text-[#6b7280] uppercase tracking-wider text-left whitespace-nowrap"
                  >
                    <div className="flex items-center gap-1">
                      {column.header}
                      {column.sortable !== false && (
                        <ChevronsUpDown className="h-3 w-3 text-[#d1d5db]" />
                      )}
                    </div>
                  </th>
                ))}
              </tr>
            </thead>

            <tbody>
              {loading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <React.Fragment key={i}>
                    {renderSkeletonRow()}
                  </React.Fragment>
                ))
              ) : filteredData.length > 0 ? (
                filteredData.map((row: T, rowIndex) => (
                  <tr
                    key={row.id || rowIndex}
                    className="border-b border-[#f3f4f6] transition-colors hover:bg-[#f9fafb]"
                  >
                    {columns.map((column) => (
                      <td
                        key={column.accessorKey}
                        className="px-4 py-2.5 text-sm text-[#374151] whitespace-nowrap"
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
                      <p className="text-lg font-medium text-[#6b7280]">
                        No matching results
                      </p>
                      <p className="text-sm text-[#9ca3af]">
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
        {pagination && pagination.total > 8 && (
          <div className="flex items-center justify-end gap-3 px-6 pt-2 pb-0 border-t border-[#f3f4f6]">
            <p className="text-[13px] text-[#6b7280] whitespace-nowrap">
              {pagination.total} results
            </p>

            <div className="flex items-center gap-1">
              <Button
                variant="outline"
                size="icon"
                className="h-8 w-8 rounded-lg border-[#e5e7eb] text-[#6b7280]"
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
                    className="px-2 text-[#9ca3af]"
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
                className="h-8 w-8 rounded-lg border-[#e5e7eb] text-[#6b7280]"
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
