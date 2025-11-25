import { createFileRoute, Outlet, Navigate, Link, useLocation } from '@tanstack/react-router'
import { useAuth } from '../store/auth'
import { LoadingSpinner } from '../components'

export const Route = createFileRoute('/_authenticated')({
  component: AuthenticatedLayout,
})

function AuthenticatedLayout() {
  const { isAuthenticated, isLoading, user, logout } = useAuth()
  const location = useLocation()

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

  const navItems = getNavItemsForRole(user?.role)

  return (
    <div className="min-h-screen bg-[#0a0a0f]">
      <nav className="border-b border-[#2a2a3a] bg-[#12121a]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-8">
              <Link to="/" className="text-xl font-bold text-[#e4e4e7]">
                Cars
              </Link>
              <div className="flex items-center gap-1">
                {navItems.map((item) => (
                  <Link
                    key={item.to}
                    to={item.to}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                      location.pathname === item.to
                        ? 'bg-indigo-600 text-white'
                        : 'text-[#71717a] hover:text-[#e4e4e7] hover:bg-[#1a1a24]'
                    }`}
                  >
                    {item.label}
                  </Link>
                ))}
              </div>
            </div>
            <div className="flex items-center gap-4">
              <span className="text-sm text-[#71717a]">
                {user?.role && (
                  <span className="px-2 py-1 bg-[#1a1a24] border border-[#2a2a3a] rounded text-xs">
                    {user.role}
                  </span>
                )}
              </span>
              <button
                onClick={logout}
                className="text-sm text-[#71717a] hover:text-[#e4e4e7] transition-colors"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </nav>
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Outlet />
      </main>
    </div>
  )
}

function getNavItemsForRole(role: string | null | undefined) {
  const items: { to: string; label: string }[] = []

  if (role === 'Admin') {
    items.push({ to: '/admin', label: 'Users' })
    items.push({ to: '/car-spec', label: 'Car Specs' })
    items.push({ to: '/catalog', label: 'Catalog' })
    items.push({ to: '/my-cars', label: 'My Cars' })
  } else if (role === 'CarSpec') {
    items.push({ to: '/car-spec', label: 'Car Specs' })
    items.push({ to: '/catalog', label: 'Catalog' })
  } else {
    items.push({ to: '/catalog', label: 'Catalog' })
    items.push({ to: '/my-cars', label: 'My Cars' })
  }

  return items
}

