"use client"

import { useState } from "react"

import { Button, buttonVariants } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
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

export const REASON_MAX_LENGTH = 500

interface ReasonDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  title: string
  description?: string
  placeholder?: string
  confirmLabel?: string
  cancelLabel?: string
  /** Receives the trimmed reason ("" when left empty — caller decides). */
  onConfirm: (reason: string) => void
  loading?: boolean
}

/**
 * Confirm-style dialog that collects a short free-text reason before a
 * destructive moderation action (e.g. removing a review).
 *
 * Mirrors ConfirmDialog's structure/labels so it drops into the same flows,
 * with a controlled Textarea (maxLength 500, matching the backend zod limit)
 * as the extra step. The reason resets to "" every time the dialog opens.
 */
function ReasonDialog({
  open,
  onOpenChange,
  title,
  description,
  placeholder,
  confirmLabel = "Confirm",
  cancelLabel = "Cancel",
  onConfirm,
  loading = false,
}: ReasonDialogProps) {
  const [reason, setReason] = useState("")

  // Reset on close (an event handler, not an effect): the next open — for the
  // same or a different target — always starts with a fresh reason.
  const handleOpenChange = (nextOpen: boolean) => {
    if (!nextOpen) setReason("")
    onOpenChange(nextOpen)
  }

  return (
    <AlertDialog open={open} onOpenChange={handleOpenChange}>
      <AlertDialogPortal>
        <AlertDialogBackdrop />
        <AlertDialogPopup>
          <AlertDialogTitle>{title}</AlertDialogTitle>
          {description && (
            <AlertDialogDescription>{description}</AlertDialogDescription>
          )}
          <div className="mt-4">
            <Textarea
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder={placeholder}
              maxLength={REASON_MAX_LENGTH}
              rows={3}
              aria-label={placeholder ?? title}
            />
            <p className="mt-1 text-right text-xs text-muted-foreground">
              {reason.length}/{REASON_MAX_LENGTH}
            </p>
          </div>
          <div className="mt-4 flex items-center justify-end gap-2">
            <AlertDialogClose
              className={cn(buttonVariants({ variant: "outline" }))}
              disabled={loading}
            >
              {cancelLabel}
            </AlertDialogClose>
            <Button
              variant="destructive"
              disabled={loading}
              onClick={() => {
                onConfirm(reason.trim())
                handleOpenChange(false)
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

export interface ReasonRequest {
  title: string
  description?: string
  placeholder?: string
  confirmLabel?: string
  cancelLabel?: string
  loading?: boolean
  onConfirm: (reason: string) => void
}

/**
 * Minimal wiring for one-off reason prompts:
 *
 *   const { promptReason, dialog } = useReasonDialog()
 *   // render {dialog} once near the top of the component return
 *   promptReason({ title: "Reject review", onConfirm: (reason) => doReject(id, reason) })
 */
function useReasonDialog() {
  const [request, setRequest] = useState<ReasonRequest | null>(null)

  const promptReason = (req: ReasonRequest) => {
    setRequest(req)
  }

  const dialog = (
    <ReasonDialog
      open={request !== null}
      onOpenChange={(open) => {
        if (!open) setRequest(null)
      }}
      title={request?.title ?? ""}
      description={request?.description}
      placeholder={request?.placeholder}
      confirmLabel={request?.confirmLabel}
      cancelLabel={request?.cancelLabel}
      loading={request?.loading}
      onConfirm={(reason) => {
        request?.onConfirm(reason)
        setRequest(null)
      }}
    />
  )

  return { promptReason, dialog }
}

export { ReasonDialog, useReasonDialog }
