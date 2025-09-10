'use client';

import * as React from "react"
import { Check, ChevronsUpDown, User, Clock, CheckCircle } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/ui/button"
import { Badge } from "@/ui/badge"
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

interface RegisteredUser {
  id: string;
  name: string;
  email: string;
  registeredAt: string;
  hasFaceRegistration: boolean;
  faceRegistration?: {
    id: string;
    registeredAt: string;
    hasValidDescriptor: boolean;
  };
}

interface UserSelectionComboboxProps {
  value?: string;
  onValueChange?: (value: string, user: RegisteredUser | null) => void;
  placeholder?: string;
  className?: string;
  error?: boolean;
  disabled?: boolean;
}

export function UserSelectionCombobox({ 
  value, 
  onValueChange, 
  placeholder = "Pilih pengguna untuk registrasi wajah",
  className,
  error = false,
  disabled = false
}: UserSelectionComboboxProps) {
  const [open, setOpen] = React.useState(false);
  const [users, setUsers] = React.useState<RegisteredUser[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [fetchError, setFetchError] = React.useState<string | null>(null);

  // Fetch registered users
  React.useEffect(() => {
    const fetchUsers = async () => {
      try {
        setLoading(true);
        const response = await fetch('/api/users/registered');
        const data = await response.json();
        
        if (data.success) {
          setUsers(data.data || []);
          setFetchError(null);
        } else {
          throw new Error(data.error || 'Failed to fetch users');
        }
      } catch (err) {
        console.error('Error fetching registered users:', err);
        setFetchError(err instanceof Error ? err.message : 'Unknown error');
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, []);

  const selectedUser = users.find((user) => user.id === value);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('id-ID', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
  };

  // Separate users by face registration status
  const usersWithoutFace = users.filter(user => !user.hasFaceRegistration);
  const usersWithFace = users.filter(user => user.hasFaceRegistration);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className={cn(
            "w-full justify-between text-left font-normal h-auto min-h-[2.5rem]",
            !value && "text-muted-foreground",
            error && "border-red-300 focus:border-red-500",
            className
          )}
          disabled={disabled || loading}
        >
          {loading ? (
            <span className="text-muted-foreground">Memuat pengguna...</span>
          ) : selectedUser ? (
            <div className="flex items-center space-x-2">
              <User className="h-4 w-4" />
              <div className="flex flex-col">
                <span className="font-medium">{selectedUser.name}</span>
                <span className="text-xs text-muted-foreground">{selectedUser.email}</span>
              </div>
            </div>
          ) : (
            <span>{placeholder}</span>
          )}
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[400px] p-0" align="start">
        <Command>
          <CommandInput 
            placeholder="Cari pengguna..." 
            className="h-9" 
          />
          <CommandList>
            <CommandEmpty>
              {fetchError ? (
                <div className="p-4 text-center text-red-600">
                  <p className="text-sm">Gagal memuat data pengguna</p>
                  <p className="text-xs text-muted-foreground mt-1">{fetchError}</p>
                </div>
              ) : (
                <div className="p-4 text-center text-muted-foreground">
                  <p className="text-sm">Pengguna tidak ditemukan</p>
                </div>
              )}
            </CommandEmpty>
            
            {/* Users without face registration (priority) */}
            {usersWithoutFace.length > 0 && (
              <CommandGroup heading="Belum Registrasi Wajah">
                {usersWithoutFace.map((user) => (
                  <CommandItem
                    key={user.id}
                    value={`${user.name} ${user.email}`}
                    onSelect={() => {
                      const newValue = user.id === value ? "" : user.id;
                      onValueChange?.(newValue, newValue ? user : null);
                      setOpen(false);
                    }}
                    className="flex items-center justify-between p-3 cursor-pointer"
                  >
                    <div className="flex items-center space-x-3 flex-1">
                      <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center">
                        <User className="h-4 w-4 text-blue-600" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="font-medium text-sm">{user.name}</div>
                        <div className="text-xs text-muted-foreground truncate">
                          {user.email}
                        </div>
                        <div className="flex items-center space-x-2 mt-1">
                          <Clock className="h-3 w-3 text-muted-foreground" />
                          <span className="text-xs text-muted-foreground">
                            Daftar: {formatDate(user.registeredAt)}
                          </span>
                        </div>
                      </div>
                      <Badge variant="outline" className="text-xs border-amber-300 text-amber-700">
                        Perlu Registrasi
                      </Badge>
                    </div>
                    <Check
                      className={cn(
                        "ml-2 h-4 w-4",
                        value === user.id ? "opacity-100" : "opacity-0"
                      )}
                    />
                  </CommandItem>
                ))}
              </CommandGroup>
            )}

            {/* Users with face registration (secondary) */}
            {usersWithFace.length > 0 && (
              <CommandGroup heading="Sudah Registrasi Wajah">
                {usersWithFace.map((user) => (
                  <CommandItem
                    key={user.id}
                    value={`${user.name} ${user.email}`}
                    onSelect={() => {
                      const newValue = user.id === value ? "" : user.id;
                      onValueChange?.(newValue, newValue ? user : null);
                      setOpen(false);
                    }}
                    className="flex items-center justify-between p-3 cursor-pointer opacity-75"
                  >
                    <div className="flex items-center space-x-3 flex-1">
                      <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center">
                        <CheckCircle className="h-4 w-4 text-green-600" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="font-medium text-sm">{user.name}</div>
                        <div className="text-xs text-muted-foreground truncate">
                          {user.email}
                        </div>
                        <div className="flex items-center space-x-2 mt-1">
                          <Clock className="h-3 w-3 text-muted-foreground" />
                          <span className="text-xs text-muted-foreground">
                            Wajah: {user.faceRegistration ? formatDate(user.faceRegistration.registeredAt) : 'N/A'}
                          </span>
                        </div>
                      </div>
                      <Badge variant="default" className="text-xs bg-green-100 text-green-700 border-green-300">
                        Sudah Terdaftar
                      </Badge>
                    </div>
                    <Check
                      className={cn(
                        "ml-2 h-4 w-4",
                        value === user.id ? "opacity-100" : "opacity-0"
                      )}
                    />
                  </CommandItem>
                ))}
              </CommandGroup>
            )}
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  )
}