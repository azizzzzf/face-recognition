'use client'

import { useState } from 'react'
import { useForm, Controller } from 'react-hook-form'
import { Button } from '@/ui/button'
import { Input } from '@/ui/input'
import { Card, CardContent } from '@/ui/card'
import { Alert, AlertDescription } from '@/ui/alert'
import { Label } from '@/ui/label'
import { Loader2, Eye, EyeOff } from 'lucide-react'
import { RoleCombobox } from '@/components/ui/role-combobox'

interface LoginFormData {
  email: string
  password: string
}

interface RegisterFormData extends LoginFormData {
  name: string
  role: 'ADMIN' | 'USER'
  confirmPassword: string
}

interface AuthFormProps {
  mode: 'login' | 'register'
  onSubmit: (data: LoginFormData | RegisterFormData) => Promise<{ error?: string }>
  loading?: boolean
}

export function AuthForm({ mode, onSubmit, loading = false }: AuthFormProps) {
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)

  const { register, handleSubmit, formState: { errors }, watch, reset, control } = useForm<RegisterFormData>()

  const password = watch('password')

  const handleFormSubmit = async (data: RegisterFormData) => {
    setError(null)
    setSuccess(null)
    
    if (mode === 'register' && data.password !== data.confirmPassword) {
      setError('Password tidak cocok')
      return
    }

    try {
      const result = await onSubmit(data)
      if (result.error) {
        setError(result.error)
      } else {
        setSuccess(mode === 'login' ? 'Login berhasil!' : 'Registrasi berhasil!')
        reset()
      }
    } catch (err) {
      setError('Terjadi kesalahan yang tidak terduga')
    }
  }

  return (
    <Card className="w-full max-w-md mx-auto shadow-xl border-gray-200">
      <CardContent className="p-6">
        <div className="text-center mb-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            {mode === 'login' ? 'Masuk ke Akun' : 'Buat Akun Baru'}
          </h2>
          <p className="text-sm text-gray-600">
            {mode === 'login' 
              ? 'Masukkan kredensial Anda untuk mengakses sistem' 
              : 'Lengkapi informasi untuk membuat akun'}
          </p>
        </div>

        {error && (
          <Alert variant="destructive" className="mb-4">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {success && (
          <Alert className="mb-4 border-green-200 bg-green-50">
            <AlertDescription className="text-green-800">{success}</AlertDescription>
          </Alert>
        )}

        <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4">
          {mode === 'register' && (
            <div className="space-y-2">
              <Label htmlFor="name" className="text-sm font-medium text-gray-700">
                Nama Lengkap
              </Label>
              <Input
                id="name"
                type="text"
                placeholder="Masukkan nama lengkap"
                {...register('name', { 
                  required: 'Nama harus diisi',
                  minLength: { value: 2, message: 'Nama minimal 2 karakter' }
                })}
                className={errors.name ? 'border-red-300 focus:border-red-500' : ''}
              />
              {errors.name && (
                <p className="text-sm text-red-600">{errors.name.message}</p>
              )}
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="email" className="text-sm font-medium text-gray-700">
              Email
            </Label>
            <Input
              id="email"
              type="email"
              placeholder="nama@example.com"
              {...register('email', { 
                required: 'Email harus diisi',
                pattern: {
                  value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                  message: 'Format email tidak valid'
                }
              })}
              className={errors.email ? 'border-red-300 focus:border-red-500' : ''}
            />
            {errors.email && (
              <p className="text-sm text-red-600">{errors.email.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="password" className="text-sm font-medium text-gray-700">
              Password
            </Label>
            <div className="relative">
              <Input
                id="password"
                type={showPassword ? 'text' : 'password'}
                placeholder="Masukkan password"
                {...register('password', { 
                  required: 'Password harus diisi',
                  minLength: { value: 6, message: 'Password minimal 6 karakter' }
                })}
                className={`pr-10 ${errors.password ? 'border-red-300 focus:border-red-500' : ''}`}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
            {errors.password && (
              <p className="text-sm text-red-600">{errors.password.message}</p>
            )}
          </div>

          {mode === 'register' && (
            <>
              <div className="space-y-2">
                <Label htmlFor="confirmPassword" className="text-sm font-medium text-gray-700">
                  Konfirmasi Password
                </Label>
                <div className="relative">
                  <Input
                    id="confirmPassword"
                    type={showConfirmPassword ? 'text' : 'password'}
                    placeholder="Ulangi password"
                    {...register('confirmPassword', { 
                      required: 'Konfirmasi password harus diisi',
                      validate: value => value === password || 'Password tidak cocok'
                    })}
                    className={`pr-10 ${errors.confirmPassword ? 'border-red-300 focus:border-red-500' : ''}`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
                  >
                    {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
                {errors.confirmPassword && (
                  <p className="text-sm text-red-600">{errors.confirmPassword.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="role" className="text-sm font-medium text-gray-700">
                  Role Pengguna
                </Label>
                <Controller
                  name="role"
                  control={control}
                  rules={{ required: 'Role harus dipilih' }}
                  render={({ field }) => (
                    <RoleCombobox
                      value={field.value}
                      onValueChange={field.onChange}
                      placeholder="Pilih Role"
                      error={!!errors.role}
                    />
                  )}
                />
                {errors.role && (
                  <p className="text-sm text-red-600">{errors.role.message}</p>
                )}
              </div>
            </>
          )}

          <Button
            type="submit"
            disabled={loading}
            className="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 font-semibold shadow-lg hover:shadow-xl transition-all duration-300"
          >
            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {mode === 'login' ? 'Masuk' : 'Daftar'}
          </Button>
        </form>

        <div className="mt-6 text-center">
          <p className="text-sm text-gray-600">
            {mode === 'login' ? 'Belum punya akun?' : 'Sudah punya akun?'}
            <a
              href={mode === 'login' ? '/auth/register' : '/auth/login'}
              className="ml-1 font-medium text-blue-600 hover:text-blue-500 transition-colors"
            >
              {mode === 'login' ? 'Daftar di sini' : 'Masuk di sini'}
            </a>
          </p>
        </div>
      </CardContent>
    </Card>
  )
}