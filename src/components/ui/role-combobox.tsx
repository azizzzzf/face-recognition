"use client"

import * as React from "react"
import { Check, ChevronsUpDown } from "lucide-react"

import { cn } from "@/lib/utils"
import { Button } from "@/ui/button"
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/ui/command"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/ui/popover"

const roles = [
  {
    value: "USER",
    label: "User",
    description: "Dapat mengakses recognize & attendance personal"
  },
  {
    value: "ADMIN",
    label: "Admin", 
    description: "Akses penuh ke semua fitur"
  },
]

interface RoleComboboxProps {
  value?: string
  onValueChange?: (value: string) => void
  placeholder?: string
  className?: string
  error?: boolean
}

export function RoleCombobox({ 
  value, 
  onValueChange, 
  placeholder = "Pilih Role",
  className,
  error = false
}: RoleComboboxProps) {
  const [open, setOpen] = React.useState(false)

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className={cn(
            "w-full justify-between text-left font-normal",
            !value && "text-muted-foreground",
            error && "border-red-300 focus:border-red-500",
            className
          )}
        >
          {value
            ? roles.find((role) => role.value === value)?.label
            : placeholder}
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-full p-0">
        <Command>
          <CommandInput placeholder="Cari role..." className="h-9" />
          <CommandList>
            <CommandEmpty>Role tidak ditemukan.</CommandEmpty>
            <CommandGroup>
              {roles.map((role) => (
                <CommandItem
                  key={role.value}
                  value={role.value}
                  onSelect={(currentValue) => {
                    const selectedValue = currentValue === value ? "" : currentValue.toUpperCase()
                    onValueChange?.(selectedValue)
                    setOpen(false)
                  }}
                  className="flex flex-col items-start p-3"
                >
                  <div className="flex items-center w-full">
                    <div className="flex-1">
                      <div className="font-medium">{role.label}</div>
                      <div className="text-xs text-muted-foreground mt-1">
                        {role.description}
                      </div>
                    </div>
                    <Check
                      className={cn(
                        "ml-2 h-4 w-4",
                        value === role.value ? "opacity-100" : "opacity-0"
                      )}
                    />
                  </div>
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  )
}