import { createFileRoute, Navigate, useNavigate } from '@tanstack/react-router'
import { useForm } from '@tanstack/react-form'
import { useMutation } from '@tanstack/react-query'
import { useAuth } from '../store/auth'
import { login as loginApi } from '../api'
import { loginSchema } from '../schemas'
import { Button, Input, LoadingSpinner } from '../components'

export const Route = createFileRoute('/login')({
  component: LoginPage,
})

function LoginPage() {
  const { isAuthenticated, isLoading, login } = useAuth()
  const navigate = useNavigate()

  const mutation = useMutation({
    mutationFn: loginApi,
    onSuccess: (data) => {
      login(data.access_token)
      navigate({ to: '/' })
    },
  })

  const form = useForm({
    defaultValues: {
      username: '',
      password: '',
    },
    validators: {
      onChange: loginSchema,
    },
    onSubmit: async ({ value }) => {
      mutation.mutate(value)
    },
  })

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    )
  }

  if (isAuthenticated) {
    return <Navigate to="/" />
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#0a0a0f] px-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-[#e4e4e7] mb-2">Cars</h1>
          <p className="text-[#71717a]">Sign in to your account</p>
        </div>

        <div className="bg-[#12121a] border border-[#2a2a3a] rounded-xl p-6 shadow-xl">
          <form
            onSubmit={(e) => {
              e.preventDefault()
              e.stopPropagation()
              form.handleSubmit()
            }}
            className="space-y-4"
          >
            <form.Field name="username">
              {(field) => (
                <Input
                  label="Username"
                  value={field.state.value}
                  onChange={(e) => field.handleChange(e.target.value)}
                  onBlur={field.handleBlur}
                  error={typeof field.state.meta.errors?.[0] === 'string' ? field.state.meta.errors[0] : field.state.meta.errors?.[0]?.message}
                  placeholder="Enter your username"
                  autoComplete="username"
                />
              )}
            </form.Field>

            <form.Field name="password">
              {(field) => (
                <Input
                  label="Password"
                  type="password"
                  value={field.state.value}
                  onChange={(e) => field.handleChange(e.target.value)}
                  onBlur={field.handleBlur}
                  error={typeof field.state.meta.errors?.[0] === 'string' ? field.state.meta.errors[0] : field.state.meta.errors?.[0]?.message}
                  placeholder="Enter your password"
                  autoComplete="current-password"
                />
              )}
            </form.Field>

            {mutation.isError && (
              <div className="p-3 bg-red-500/10 border border-red-500/30 rounded-lg">
                <p className="text-sm text-red-400">
                  {(mutation.error as Error)?.message || 'Invalid credentials'}
                </p>
              </div>
            )}

            <Button
              type="submit"
              className="w-full"
              isLoading={mutation.isPending}
            >
              Sign In
            </Button>
          </form>
        </div>

      </div>
    </div>
  )
}

