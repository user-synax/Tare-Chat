import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva } from "class-variance-authority"
import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "inline-flex items-center justify-center whitespace-nowrap text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50",
  {
    variants: {
      variant: {
        default: "bg-secondary text-secondary-foreground border border-foreground hover:bg-secondary/80 rounded-pill",
        destructive:
          "bg-destructive text-destructive-foreground hover:bg-destructive/90 rounded-sm",
        outline:
          "border border-border bg-background hover:bg-muted hover:text-foreground rounded-sm",
        secondary:
          "bg-secondary text-secondary-foreground border border-border hover:bg-secondary/80 rounded-pill opacity-80",
        ghost: "hover:bg-muted hover:text-foreground rounded-sm",
        link: "text-green-link underline-offset-4 hover:underline",
        supabase: "bg-secondary text-secondary-foreground border border-foreground hover:bg-secondary/80 rounded-pill",
      },
      size: {
        default: "h-10 px-8 py-2",
        sm: "h-9 rounded-sm px-4",
        lg: "h-12 px-10",
        icon: "h-10 w-10 rounded-sm",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

const Button = React.forwardRef(({ className, variant, size, asChild = false, ...props }, ref) => {
  const Comp = asChild ? Slot : "button"
  return (
    <Comp
      className={cn(buttonVariants({ variant, size, className }))}
      ref={ref}
      {...props}
    />
  )
})
Button.displayName = "Button"

export { Button, buttonVariants }
