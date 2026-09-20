"use client"

import { ChevronLeft, ChevronRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { useLanguage } from "@/context/LanguageContext"

interface DataTablePaginationProps {
  table: {
    previousPage: () => void
    nextPage: () => void
    getCanPreviousPage: () => boolean
    getCanNextPage: () => boolean
    getPageCount: () => number
    setPageSize: (updater: number | ((old: number) => number)) => void
    state: { pagination: { pageIndex: number; pageSize: number } }
  }
  className?: string
}

const PAGE_SIZE_OPTIONS = [6, 10, 25, 50] as const

export function DataTablePagination({ table, className }: DataTablePaginationProps) {
  const { t } = useLanguage()
  const pageCount = table.getPageCount()
  const pagination = table.state?.pagination ?? { pageIndex: 0, pageSize: 10 }

  if (pageCount <= 0) return null

  return (
    <nav
      className={cn("flex items-center justify-between gap-4 px-2 py-4", className)}
      role="navigation"
      aria-label="Pagination"
    >
      <div className="flex items-center gap-2">
        <span className="text-sm text-muted-foreground">{t.pagination.rowsPerPage}</span>
        <select
          value={pagination.pageSize}
          onChange={(e) => {
            table.setPageSize(Number(e.target.value))
          }}
          className="h-7 rounded-md border border-input bg-transparent px-2 text-sm outline-none"
        >
          {PAGE_SIZE_OPTIONS.map((size) => (
            <option key={size} value={size}>
              {size}
            </option>
          ))}
        </select>
      </div>

      <div className="flex items-center gap-4">
        <span className="text-sm text-muted-foreground font-medium">
          {t.pagination.pageOf} {pagination.pageIndex + 1} {t.pagination.of} {pageCount}
        </span>
        <div className="flex items-center gap-1">
          <Button
            variant="outline"
            size="sm"
            disabled={!table.getCanPreviousPage()}
            onClick={() => table.previousPage()}
          >
            <ChevronLeft className="mr-1 h-4 w-4" />
            {t.pagination.previous}
          </Button>
          <Button
            variant="outline"
            size="sm"
            disabled={!table.getCanNextPage()}
            onClick={() => table.nextPage()}
          >
            {t.pagination.next}
            <ChevronRight className="ml-1 h-4 w-4" />
          </Button>
        </div>
      </div>
    </nav>
  )
}
