"use client"

import { useEffect, useMemo, useRef } from "react"
import type { ReactNode } from "react"
import {
  useTable,
  tableFeatures,
  type ColumnDef,
  type RowData,
  rowPaginationFeature,
  rowSortingFeature,
  columnFilteringFeature,
  createPaginatedRowModel,
  createSortedRowModel,
  createFilteredRowModel,
  sortFn_alphanumeric,
  filterFn_includesString,
} from "@tanstack/react-table"

import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from "@/components/ui/table"
import { DataTablePagination } from "@/components/ui/data-table-pagination"

/**
 * Generic column definition type compatible with any feature set.
 *
 * Existing callers that use `DataTableColumn` (no generic) get `DataTableColumn<any>`,
 * which is assignable to any features + data combination.
 */
export type DataTableColumn<TData extends RowData = any> = ColumnDef<any, TData>

interface DataTableProps<TData extends RowData> {
  columns: DataTableColumn<TData>[]
  data: TData[]
  emptyContent?: ReactNode
  getHeaderClassName?: (headerId: string) => string | undefined
  enablePagination?: boolean
  enableSorting?: boolean
  enableFiltering?: boolean
  pageSize?: number
  searchKey?: string
  searchPlaceholder?: string
  searchValue?: string
  onSearchChange?: (value: string) => void
  showPagination?: boolean
}

export function DataTable<TData extends RowData>({
  columns,
  data,
  emptyContent,
  getHeaderClassName,
  enablePagination = true,
  enableSorting = false,
  enableFiltering = false,
  pageSize = 10,
  searchKey,
  searchPlaceholder,
  searchValue,
  onSearchChange,
  showPagination = true,
}: DataTableProps<TData>) {
  const prevSearchRef = useRef(searchValue)
  const prevDataRef = useRef(data)

  // Build the features object with row model factories and function registries.
  // Using `as any` to bypass v9's strict feature-slot typing — the generic
  // DataTable component intentionally supports any combination of features.
  const features = useMemo(() => {
    const featureMap: Record<string, unknown> = {}

    if (enablePagination) {
      featureMap.rowPaginationFeature = rowPaginationFeature
      featureMap.paginatedRowModel = createPaginatedRowModel()
    }
    if (enableSorting) {
      featureMap.rowSortingFeature = rowSortingFeature
      featureMap.sortedRowModel = createSortedRowModel()
      featureMap.sortFns = { alphanumeric: sortFn_alphanumeric }
    }
    if (enableFiltering) {
      featureMap.columnFilteringFeature = columnFilteringFeature
      featureMap.filteredRowModel = createFilteredRowModel()
      featureMap.filterFns = { includesString: filterFn_includesString }
    }

    return tableFeatures(featureMap as any)
  }, [enablePagination, enableSorting, enableFiltering])

  // Reset to first page when data or search changes
  const shouldResetPage = data !== prevDataRef.current || searchValue !== prevSearchRef.current
  prevDataRef.current = data
  prevSearchRef.current = searchValue

  const table = useTable(
    {
      features: features as any,
      data,
      columns: columns as any,
      initialState: enablePagination
        ? { pagination: { pageIndex: 0, pageSize } }
        : undefined,
      autoResetAll: false,
      autoResetPageIndex: true,
    } as any,
  )

  // Reset page index on data/search change
  useEffect(() => {
    if (enablePagination && shouldResetPage) {
      table.setPageIndex(0)
    }
  }, [shouldResetPage, enablePagination, table])

  const rows = table.getRowModel().rows

  return (
    <div>
      <Table>
        <TableHeader>
          {table.getHeaderGroups().map((headerGroup) => (
            <TableRow key={headerGroup.id}>
              {headerGroup.headers.map((header) => (
                <TableHead
                  key={header.id}
                  className={getHeaderClassName?.(header.id)}
                >
                  {header.isPlaceholder ? null : (
                    <table.FlexRender header={header} />
                  )}
                </TableHead>
              ))}
            </TableRow>
          ))}
        </TableHeader>
        <TableBody>
          {rows.length === 0 ? (
            <TableRow>
              <TableCell colSpan={columns.length}>{emptyContent}</TableCell>
            </TableRow>
          ) : (
            rows.map((row) => (
              <TableRow key={row.id}>
                {row.getAllCells().map((cell) => (
                  <TableCell key={cell.id}>
                    <table.FlexRender cell={cell} />
                  </TableCell>
                ))}
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
      {showPagination && enablePagination && (
        <DataTablePagination table={table as any} />
      )}
    </div>
  )
}
