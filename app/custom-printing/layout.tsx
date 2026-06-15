import type { ReactNode } from "react"
import { MockupPreviewAnnouncement } from "@/components/custom-printing/MockupPreviewAnnouncement"

export default function CustomPrintingSectionLayout({
  children,
}: {
  children: ReactNode
}) {
  return (
    <>
      <MockupPreviewAnnouncement />
      {children}
    </>
  )
}
