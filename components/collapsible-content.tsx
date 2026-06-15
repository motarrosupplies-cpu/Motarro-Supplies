"use client"

import { useState } from "react"
import { ChevronDown, ChevronUp } from "lucide-react"
import { Button } from "@/components/ui/button"

interface CollapsibleContentProps {
  title: string
  children: React.ReactNode
  defaultOpen?: boolean
  className?: string
}

export function CollapsibleContent({ 
  title, 
  children, 
  defaultOpen = false,
  className = "" 
}: CollapsibleContentProps) {
  const [isOpen, setIsOpen] = useState(defaultOpen)

  return (
    <div className={`border rounded-lg overflow-hidden w-full ${className}`}>
      <Button
        variant="ghost"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full justify-between p-4 h-auto min-h-[3rem] gap-2 whitespace-normal overflow-hidden"
      >
        <span className="text-sm font-medium text-left flex-1 break-words overflow-wrap-anywhere pr-2 min-w-0">{title}</span>
        <span className="shrink-0 ml-2">
          {isOpen ? (
            <ChevronUp className="h-4 w-4" />
          ) : (
            <ChevronDown className="h-4 w-4" />
          )}
        </span>
      </Button>
      {isOpen && (
        <div className="px-4 pb-4 break-words overflow-wrap-anywhere w-full">
          {children}
        </div>
      )}
    </div>
  )
}
