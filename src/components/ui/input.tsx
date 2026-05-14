import * as React from "react"

import { cn } from "@/lib/utils"

function Input({ className, type, ...props }: React.ComponentProps<"input">) {
  return (
    <input
      type={type}
      data-slot="input"
      className={cn(
        "h-14 w-full rounded-xl border border-gray-200 bg-transparent px-4 py-2 text-base transition-colors outline-none placeholder:text-gray-400 focus-visible:ring-2 focus-visible:ring-green-500 focus:border-green-500 disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50",
        className
      )}
      {...props}
    />
  )
}

export { Input }