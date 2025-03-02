import * as React from "react"
import { cn } from "@/lib/utils"

interface ButtonGroupProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: "default" | "outline"
  size?: "default" | "sm" | "lg"
}

const ButtonGroup = React.forwardRef<HTMLDivElement, ButtonGroupProps>(
  ({ className, variant = "outline", size = "default", ...props }, ref) => {
    return (
      <div
        className={cn(
          "inline-flex items-center justify-center rounded-md",
          className
        )}
        ref={ref}
        {...props}
      />
    )
  }
)
ButtonGroup.displayName = "ButtonGroup"

interface ButtonGroupItemProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  asChild?: boolean
  active?: boolean
}

const ButtonGroupItem = React.forwardRef<HTMLButtonElement, ButtonGroupItemProps>(
  ({ className, active = false, asChild = false, ...props }, ref) => {
    const Comp = asChild ? React.Fragment : "button"
    const compProps = asChild ? { children: props.children } : props

    return (
      <Comp
        className={cn(
          "inline-flex items-center justify-center whitespace-nowrap rounded-md px-4 py-2 text-sm font-medium transition-colors",
          "focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring",
          "disabled:pointer-events-none disabled:opacity-50",
          "border border-input hover:bg-accent hover:text-accent-foreground",
          active && "bg-accent text-accent-foreground",
          "first:rounded-r-none [&:not(:first-child):not(:last-child)]:rounded-none last:rounded-l-none",
          "first:border-r-0 [&:not(:first-child):not(:last-child)]:border-r-0",
          className
        )}
        ref={ref}
        {...compProps}
      />
    )
  }
)
ButtonGroupItem.displayName = "ButtonGroupItem"

export { ButtonGroup, ButtonGroupItem } 