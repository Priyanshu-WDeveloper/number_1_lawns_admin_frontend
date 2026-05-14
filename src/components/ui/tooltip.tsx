"use client"

import * as React from "react"

import { cn } from "@/lib/utils"

function TooltipProvider({
  delayDuration = 0,
  ...props
}: React.ComponentProps<"div"> & { delayDuration?: number }) {
  return (
    <div
      data-slot="tooltip-provider"
      style={{ "--tooltip-delay-duration": `${delayDuration}ms` } as React.CSSProperties}
      {...props}
    />
  )
}

interface TooltipProps {
  children?: React.ReactNode
}

function Tooltip({ children }: TooltipProps) {
  return <div data-slot="tooltip">{children}</div>
}

interface TooltipTriggerProps extends React.ComponentProps<"button"> {
  asChild?: boolean
}

function TooltipTrigger({ children, ...props }: TooltipTriggerProps) {
  return (
    <button data-slot="tooltip-trigger" {...props}>
      {children}
    </button>
  )
}

interface TooltipContentProps extends React.ComponentProps<"div"> {
  sideOffset?: number
  side?: "top" | "right" | "bottom" | "left"
  align?: "start" | "center" | "end"
}

function TooltipContent({
  className,
  sideOffset = 0,
  children,
  ...props
}: TooltipContentProps) {
  return (
    <div
      data-slot="tooltip-content"
      className={cn(
        "z-50 inline-flex w-fit max-w-xs items-center gap-1.5 rounded-md bg-foreground px-3 py-1.5 text-xs text-background",
        className
      )}
      style={{ marginTop: sideOffset }}
      {...props}
    >
      {children}
    </div>
  )
}

export { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger }