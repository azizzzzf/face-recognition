import * as React from "react"

interface TabsContextValue {
  selectedTab: string
  setSelectedTab: (id: string) => void
}

const TabsContext = React.createContext<TabsContextValue | undefined>(undefined)

function useTabs() {
  const context = React.useContext(TabsContext)
  if (!context) {
    throw new Error("Tabs components must be used within a TabsProvider")
  }
  return context
}

export interface TabsProps {
  defaultValue: string
  value?: string
  onValueChange?: (value: string) => void
  children: React.ReactNode
  className?: string
}

export function Tabs({
  defaultValue,
  value,
  onValueChange,
  children,
  className = "",
}: TabsProps) {
  const [selectedTab, setSelectedTab] = React.useState(value || defaultValue)
  
  React.useEffect(() => {
    if (value) {
      setSelectedTab(value)
    }
  }, [value])
  
  const handleTabChange = React.useCallback((tabValue: string) => {
    if (!value) {
      setSelectedTab(tabValue)
    }
    onValueChange?.(tabValue)
  }, [onValueChange, value])
  
  return (
    <TabsContext.Provider value={{ selectedTab, setSelectedTab: handleTabChange }}>
      <div className={className}>
        {children}
      </div>
    </TabsContext.Provider>
  )
}

export interface TabsListProps {
  children: React.ReactNode
  className?: string
}

export function TabsList({ children, className = "" }: TabsListProps) {
  return (
    <div className={`inline-flex bg-zinc-100 dark:bg-zinc-800 p-1 rounded-md ${className}`}>
      {children}
    </div>
  )
}

export interface TabsTriggerProps {
  value: string
  children: React.ReactNode
  className?: string
  disabled?: boolean
}

export function TabsTrigger({
  value,
  children,
  className = "",
  disabled = false,
}: TabsTriggerProps) {
  const { selectedTab, setSelectedTab } = useTabs()
  const isSelected = selectedTab === value
  
  return (
    <button
      type="button"
      role="tab"
      aria-selected={isSelected}
      disabled={disabled}
      data-state={isSelected ? "active" : "inactive"}
      onClick={() => setSelectedTab(value)}
      className={`
        px-4 py-2 text-sm font-medium rounded-md transition-all
        ${isSelected 
          ? "bg-white dark:bg-zinc-900 text-black dark:text-white shadow-sm" 
          : "text-zinc-600 dark:text-zinc-400 hover:text-black dark:hover:text-white"
        }
        ${disabled ? "opacity-50 cursor-not-allowed" : ""}
        ${className}
      `}
    >
      {children}
    </button>
  )
}

export interface TabsContentProps {
  value: string
  children: React.ReactNode
  className?: string
}

export function TabsContent({
  value,
  children,
  className = "",
}: TabsContentProps) {
  const { selectedTab } = useTabs()
  const isSelected = selectedTab === value
  
  if (!isSelected) return null
  
  return (
    <div
      role="tabpanel"
      data-state={isSelected ? "active" : "inactive"}
      className={className}
    >
      {children}
    </div>
  )
} 