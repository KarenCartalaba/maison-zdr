"use client"

import { useCallback, useState } from "react"

import { Button, buttonVariants } from "@/components/ui/button"
import {
  AlertDialog,
  AlertDialogPortal,
  AlertDialogBackdrop,
  AlertDialogPopup,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogClose,
} from "@/components/ui/alert-dialog"
import { cn } from "@/lib/utils"

interface ConfirmDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  title: string
  description?: string
  confirmLabel?: string
  cancelLabel?: string
  onConfirm: () => void
}

/**
 * Reusable destructive confirmation dialog (replaces native confirm()).
 * Cancel is a native AlertDialog close (no render-prop composition);
 * confirm runs the caller's action, which owns its own toasts + loading state.
 */
function ConfirmDialog({
  open,
  onOpenChange,
  title,
  description,
  confirmLabel = "Confirm",
  cancelLabel = "Cancel",
  onConfirm,
}: ConfirmDialogProps) {
  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogPortal>
        <AlertDialogBackdrop />
        <AlertDialogPopup>
          <AlertDialogTitle>{title}</AlertDialogTitle>
          {description && (
            <AlertDialogDescription>{description}</AlertDialogDescription>
          )}
          <div className="mt-6 flex items-center justify-end gap-2">
            <AlertDialogClose
              className={cn(buttonVariants({ variant: "outline" }))}
            >
              {cancelLabel}
            </AlertDialogClose>
            <Button
              variant="destructive"
              onClick={() => {
                onConfirm()
                onOpenChange(false)
              }}
            >
              {confirmLabel}
            </Button>
          </div>
        </AlertDialogPopup>
      </AlertDialogPortal>
    </AlertDialog>
  )
}

export interface ConfirmRequest {
  title: string
  description?: string
  confirmLabel?: string
  onConfirm: () => void
}

/**
 * Minimal wiring for one-off confirmations:
 *
 *   const { confirm, dialog } = useConfirm()
 *   // render {dialog} once near the top of the component return
 *   confirm({ title: "Delete event", description: "...", confirmLabel: "Delete", onConfirm: () => doDelete(id) })
 */
function useConfirm() {
  const [request, setRequest] = useState<ConfirmRequest | null>(null)

  const confirm = useCallback((req: ConfirmRequest) => {
    setRequest(req)
  }, [])

  const dialog = (
    <ConfirmDialog
      open={request !== null}
      onOpenChange={(open) => {
        if (!open) setRequest(null)
      }}
      title={request?.title ?? ""}
      description={request?.description}
      confirmLabel={request?.confirmLabel}
      onConfirm={() => {
        request?.onConfirm()
        setRequest(null)
      }}
    />
  )

  return { confirm, dialog }
}

export { ConfirmDialog, useConfirm }
