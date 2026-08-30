"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  className?: string;
}

export function Pagination({
  currentPage,
  totalPages,
  onPageChange,
  className,
}: PaginationProps) {
  if (totalPages <= 1) return null;

  return (
    <nav
      className={cn("flex items-center justify-center gap-4", className)}
      role="navigation"
      aria-label="Pagination"
    >
      <Button
        variant="outline"
        size="sm"
        disabled={currentPage === 1}
        onClick={() => onPageChange(currentPage - 1)}
        render={(props) => (
          <button {...props}>
            <ChevronLeft className="mr-1 h-4 w-4" />
            Previous
          </button>
        )}
      />

      <span className="text-sm text-muted-foreground font-medium">
        Page {currentPage} of {totalPages}
      </span>

      <Button
        variant="outline"
        size="sm"
        disabled={currentPage === totalPages}
        onClick={() => onPageChange(currentPage + 1)}
        render={(props) => (
          <button {...props}>
            Next
            <ChevronRight className="ml-1 h-4 w-4" />
          </button>
        )}
      />
    </nav>
  );
}
