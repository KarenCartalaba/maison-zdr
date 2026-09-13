"use client"

import type { ReactNode } from "react"
import { useTable, tableFeatures, type ColumnDef } from "@tanstack/react-table"

import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from "@/components/ui/table"

const features = tableFeatures({})

export type DataTableColumn = ColumnDef<typeof features, any>

interface DataTableProps {
  columns: DataTableColumn[]
  data: any[]
  emptyContent?: ReactNode
  getHeaderClassName?: (headerId: string) => string | undefined
}

export function DataTable({ columns, data, emptyContent, getHeaderClassName }: DataTableProps) {
  const table = useTable({ features, data, columns })
  const rows = table.getRowModel().rows
  return (
    <Table>
      <TableHeader>
        {table.getHeaderGroups().map((headerGroup) => (
          <TableRow key={headerGroup.id}>
            {headerGroup.headers.map((header) => (
              <TableHead key={header.id} className={getHeaderClassName?.(header.id)}>
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
  )
}
