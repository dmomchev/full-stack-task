import { createFileRoute, Navigate } from '@tanstack/react-router'
import { useAuth } from '../store/auth'
import { LoadingSpinner } from '../components'

export const Route = createFileRoute('/')({
  component: IndexPage,
})

function IndexPage() {
  const { isAuthenticated, isLoading, user } = useAuth()

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    )
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" />
  }

  // Redirect based on role
  if (user?.role === 'Admin') {
    return <Navigate to="/admin" />
  } else if (user?.role === 'CarSpec') {
    return <Navigate to="/car-spec" />
  } else {
    return <Navigate to="/catalog" />
  }
}

