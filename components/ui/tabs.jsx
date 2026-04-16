import * as React from "react"
import { cn } from "@/lib/utils"

const TabsContext = React.createContext({
  value: "",
  onValueChange: () => {},
})

const Tabs = React.forwardRef(({ className, value, onValueChange, ...props }, ref) => {
  return (
    <TabsContext.Provider value={{ value, onValueChange }}>
      <div ref={ref} className={cn("", className)} {...props} />
    </TabsContext.Provider>
  )
})
Tabs.displayName = "Tabs"

const TabsList = React.forwardRef(({ className, ...props }, ref) => {
  return (
    <div
      ref={ref}
      className={cn(
        "inline-flex h-10 items-center justify-center rounded-pill border border-border bg-muted p-1",
        className
      )}
      {...props}
    />
  )
})
TabsList.displayName = "TabsList"

const TabsTrigger = React.forwardRef(({ className, value, ...props }, ref) => {
  const { value: currentValue, onValueChange } = React.useContext(TabsContext)
  const isActive = currentValue === value

  return (
    <button
      ref={ref}
      type="button"
      onClick={() => onValueChange(value)}
      className={cn(
        "inline-flex items-center justify-center whitespace-nowrap rounded-pill px-4 py-1.5 text-sm font-medium transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50",
        isActive
          ? "bg-secondary text-secondary-foreground"
          : "text-muted-foreground hover:text-foreground",
        className
      )}
      {...props}
    />
  )
})
TabsTrigger.displayName = "TabsTrigger"

const TabsContent = React.forwardRef(({ className, value, ...props }, ref) => {
  const { value: currentValue } = React.useContext(TabsContext)
  
  if (value !== currentValue) return null

  return (
    <div
      ref={ref}
      className={cn(
        "mt-4 ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
        className
      )}
      {...props}
    />
  )
})
TabsContent.displayName = "TabsContent"

export { Tabs, TabsList, TabsTrigger, TabsContent }
