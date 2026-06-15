"use client"

import dynamic from "next/dynamic"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import type { MockupGarmentId } from "@/components/custom-printing/mockupModelConfig"
import type { MockupDesign } from "@/components/custom-printing/types"

const MockupEditor3D = dynamic(
  () =>
    import("@/components/custom-printing/MockupEditor3D").then((m) => m.MockupEditor3D),
  {
    ssr: false,
    loading: () => (
      <div className="flex min-h-[40dvh] items-center justify-center rounded-lg bg-slate-50 p-8 text-sm text-muted-foreground">
        Loading mockup editor…
      </div>
    ),
  },
)

type Props = {
  open: boolean
  onOpenChange: (open: boolean) => void
  initialImageUrls: Array<{ url: string; filename?: string }>
  initialDesign?: MockupDesign | null
  initialGarmentId?: MockupGarmentId
  onConfirm: (result: { design: MockupDesign; previewPngBlob: Blob }) => void | Promise<void>
}

export function MockupEditorDialog({
  open,
  onOpenChange,
  initialImageUrls,
  initialDesign = null,
  initialGarmentId,
  onConfirm,
}: Props) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className="left-0 top-0 flex h-[100dvh] max-h-[100dvh] w-[100vw] max-w-[100vw] translate-x-0 translate-y-0 flex-col gap-0 overflow-hidden border-0 p-0 shadow-2xl sm:rounded-none [&>button]:z-20"
        onInteractOutside={(e) => e.preventDefault()}
      >
        <DialogHeader className="shrink-0 space-y-1 border-b bg-white px-4 py-3 pr-12 text-left sm:px-5">
          <DialogTitle>Mockup preview</DialogTitle>
          <DialogDescription>
            Position your design on the garment. Save when you are happy, or close to
            cancel.
          </DialogDescription>
        </DialogHeader>

        <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain bg-slate-50/80 p-3 sm:p-5">
          {open ? (
            <MockupEditor3D
              layout="fullscreen"
              initialImageUrls={initialImageUrls}
              initialDesign={initialDesign}
              initialGarmentId={initialGarmentId}
              onCancel={() => onOpenChange(false)}
              onConfirm={onConfirm}
            />
          ) : null}
        </div>
      </DialogContent>
    </Dialog>
  )
}
