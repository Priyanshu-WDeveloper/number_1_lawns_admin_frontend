import * as React from "react"
import { cn } from "../../lib/utils"
import { Input } from "../ui/input"

interface InputWithIconProps extends Omit<React.ComponentProps<"input">, "ref"> {
  icon?: React.ReactNode
  iconPosition?: "left" | "right"
  trailingIcon?: React.ReactNode
}

const InputWithIcon = React.forwardRef<HTMLInputElement, InputWithIconProps>(
  ({ className, icon, iconPosition = "left", trailingIcon, ...props }, ref) => {
    return (
      <div className="relative">
        {icon && iconPosition === "left" && (
          <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 [&>svg]:size-5">
            {icon}
          </div>
        )}
        <Input
          ref={ref}
          className={cn(
            icon && iconPosition === "left" && "ps-12",
            icon && iconPosition === "right" && "pe-12",
            trailingIcon && "pe-12",
            className
          )}
          {...props}
        />
        {icon && iconPosition === "right" && (
          <div className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 [&>svg]:size-5">
            {icon}
          </div>
        )}
        {trailingIcon && (
          <div className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 [&>svg]:size-5">
            {trailingIcon}
          </div>
        )}
      </div>
    )
  }
)

InputWithIcon.displayName = "InputWithIcon"

export { InputWithIcon }