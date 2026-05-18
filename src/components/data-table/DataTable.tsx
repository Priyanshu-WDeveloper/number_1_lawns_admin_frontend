import * as React from 'react';
import {
  Search,
  Filter,
  ChevronLeft,
  ChevronRight,
  Plus,
} from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

// Exporting generic types
export type DataTableData = Record<string, any>;

// Interface for defining table columns
export interface ColumnDef<T extends DataTableData> {
  accessorKey: string; // Key to access data in the row object
  header: string; // Header text for the column
  // Optional: Custom cell renderer
  cell?: (row: T) => React.ReactNode;
  // Optional: Field to apply filter on (e.g., 'status')
  filterField?: string;
  // Optional: Filter options if needed for specific columns
  filterOptions?: string[];
}

// Props for the generic DataTable component
interface DataTableProps<T extends DataTableData> {
  data: T[];
  columns: ColumnDef<T>[];
  title: string;
  description: string;
  addButtonLabel?: string;
  onAddClick?: () => void;
  searchPlaceholder?: string;
  filterField?: string; // Field to apply filter on (e.g., 'status')
  filterOptions?: string[]; // Options for the filter dropdown (e.g., ['All', 'Active', 'Inactive'])
  // Optional: Custom filter logic if default filtering isn't sufficient
  customFilterFn?: (
    row: T,
    searchTerm: string,
    filterValue: string,
  ) => boolean;
}

// Defining ActionButton and PaginationButton locally within DataTable.tsx
// This simplifies imports and avoids potential circular dependencies or export issues.

/* -------------------------- */
/* Reusable Action Button */
/* -------------------------- */
// interface ActionButtonProps {
//   icon: React.ReactNode;
//   onClick?: () => void;
//   variant?: 'outline' | 'default';
//   className?: string;
// }

// export function ActionButton({
//   icon,
//   onClick,
//   variant = 'outline',
//   className = '',
// }: ActionButtonProps) {
//   return (
//     <Button
//       variant={variant}
//       size="icon-sm"
//       className={`gap-2 rounded-full ${className}`}
//       onClick={onClick}
//     >
//       {icon}
//     </Button>
//   );
// }

interface ActionButtonProps extends React.ComponentProps<
  typeof Button
> {
  icon: React.ReactNode;
  onClick?: () => void;
  variant?: 'outline' | 'default';
  intent?: 'default' | 'view' | 'edit' | 'delete';
  className?: string;
}

import { cn } from '@/lib/utils';

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

/* -------------------------- */
/* Reusable Pagination Button */
/* -------------------------- */
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
      className={`h-9 w-9 rounded-lg ${active ? '' : 'bg-white'}`}
      onClick={onClick}
    >
      {icon || label}
    </Button>
  );
}

export default function DataTable<T extends DataTableData>({
  data,
  columns,
  title,
  description,
  addButtonLabel = 'Add Item',
  onAddClick,
  searchPlaceholder = 'Search...',
  filterField,
  filterOptions,
  customFilterFn,
}: DataTableProps<T>) {
  const [search, setSearch] = React.useState('');
  const [filterValue, setFilterValue] = React.useState<string>('All'); // Default filter value

  const handleFilterChange = (value: string) => {
    setFilterValue(value);
  };

  const filteredData = React.useMemo(() => {
    return data.filter((row) => {
      // Search filtering
      const matchesSearch =
        !search ||
        columns.some((col) => {
          const value = row[col.accessorKey];
          if (typeof value === 'string') {
            return value.toLowerCase().includes(search.toLowerCase());
          }
          if (typeof value === 'number') {
            return String(value).includes(search); // Allow searching numbers too
          }
          return false;
        });

      // Filter filtering
      const matchesFilter =
        !filterField ||
        !filterValue ||
        filterValue === 'All' ||
        (filterField in row &&
          row[filterField]?.toLowerCase() ===
            filterValue?.toLowerCase());

      // Custom filter function if provided
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

  // Function to render a cell based on column definition
  const renderCell = (row: T, column: ColumnDef<T>) => {
    if (column.cell) {
      return column.cell(row);
    }
    const value = row[column.accessorKey];
    if (value === undefined || value === null) {
      return '-';
    }

    if (typeof value === 'number') {
      // Format numbers, e.g., to 2 decimal places
      return value.toFixed(2);
    }

    // Return string as-is - CSS will handle ellipsis truncation
    return String(value);
  };

  return (
    <Card className="rounded-2xl w-full min-h-[70vh] bg-white shadow-sm">
      {/* <Card className="flex h-full min-h-[calc(100vh-180px)] w-full flex-col rounded-2xl bg-white shadow-sm"> */}
      <CardHeader className="flex w-full flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div className="px-4">
          <CardTitle className="text-2xl">{title}</CardTitle>
          <CardDescription>{description}</CardDescription>
        </div>
        {addButtonLabel && onAddClick && (
          <>
            <Button
              className="h-10 rounded-xl p-5"
              onClick={onAddClick}
            >
              <Plus className="h-7 w-7 mr-2" />
              {addButtonLabel}
            </Button>
          </>
        )}
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Top Filters */}
        <div className=" flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          {searchPlaceholder && (
            <div className="relative w-full max-w-sm">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder={searchPlaceholder}
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-10"
              />
            </div>
          )}

          <div className="flex items-center gap-3">
            {filterField && filterOptions && (
              <>
                <Button variant="outline" className="rounded-xl">
                  <Filter className="mr-2 h-4 w-4" />
                  Filter
                </Button>

                <Select
                  value={filterValue}
                  onValueChange={handleFilterChange}
                >
                  <SelectTrigger className="w-[160px] rounded-xl">
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
              </>
            )}
          </div>
        </div>
        {/* Table */}
        <div className="rounded-2xl border min-h-[calc(100vh-400px)]">
          {/* <table className="w-full min-h-[calc(100vh-400px)] "> */}
          <table className="w-full">
            <thead className="bg-muted/40">
              <tr className="border-b text-left">
                {columns.map((column) => (
                  <th
                    key={column.accessorKey}
                    className="px-3 py-4 text-sm font-semibold text-muted-foreground"
                  >
                    {column.header}
                  </th>
                ))}
              </tr>
            </thead>

            <tbody>
              {filteredData.length > 0 ? (
                filteredData.map((row: T, rowIndex) => (
                  <tr
                    key={row.id || rowIndex} // Use 'id' if available, otherwise index
                    className="border-b transition-colors hover:bg-muted/30"
                  >
                    {columns.map((column) => (
                      <td
                        key={column.accessorKey}
                        className="truncate px-4 py-4 text-sm"
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
                    className="h-[300px] text-center"
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
        {/* Footer - Pagination is handled by Button components imported from Buttons.tsx */}
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <p className="text-sm text-muted-foreground">
            Showing 1 to {filteredData.length} of {data.length}{' '}
            entries
          </p>

          <div className="flex items-center gap-2">
            <PaginationButton icon={<ChevronLeft />} />
            <PaginationButton label="1" active />
            <PaginationButton label="2" />
            <PaginationButton label="3" />
            <span className="px-2 text-muted-foreground">...</span>
            <PaginationButton label="5" />
            <PaginationButton icon={<ChevronRight />} />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
