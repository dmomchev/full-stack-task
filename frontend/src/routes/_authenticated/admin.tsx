import { createFileRoute, Navigate } from '@tanstack/react-router'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useForm } from '@tanstack/react-form'
import { useState } from 'react'
import { useAuth } from '../../store/auth'
import { getUsers, createUser, updateUser, deleteUser, getRoles, getUserRoles, assignRole, removeRole } from '../../api'
import { userCreateSchema } from '../../schemas'
import { Button, Input, Select, Modal, LoadingSpinner, ErrorMessage, EmptyState, Pagination } from '../../components'
import type { User, Role } from '../../types'

export const Route = createFileRoute('/_authenticated/admin')({
  component: AdminPage,
})

function AdminPage() {
  const { user } = useAuth()
  const [page, setPage] = useState(1)
  const [editingUser, setEditingUser] = useState<User | null>(null)
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
  const [roleModalUser, setRoleModalUser] = useState<User | null>(null)

  if (user?.role !== 'Admin') {
    return <Navigate to="/" />
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-[#e4e4e7]">User Management</h1>
        <Button onClick={() => setIsCreateModalOpen(true)}>Add User</Button>
      </div>

      <UsersTable 
        page={page} 
        onPageChange={setPage}
        onEdit={setEditingUser}
        onManageRoles={setRoleModalUser}
      />

      <CreateUserModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
      />

      <EditUserModal
        user={editingUser}
        onClose={() => setEditingUser(null)}
      />

      <RoleManagementModal
        user={roleModalUser}
        onClose={() => setRoleModalUser(null)}
      />
    </div>
  )
}

function UsersTable({
  page,
  onPageChange,
  onEdit,
  onManageRoles,
}: {
  page: number
  onPageChange: (page: number) => void
  onEdit: (user: User) => void
  onManageRoles: (user: User) => void
}) {
  const queryClient = useQueryClient()
  
  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ['users', page],
    queryFn: () => getUsers({ page, per_page: 10 }),
  })

  const deleteMutation = useMutation({
    mutationFn: deleteUser,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] })
    },
  })

  if (isLoading) {
    return <LoadingSpinner className="py-12" />
  }

  if (isError) {
    return <ErrorMessage message="Failed to load users" onRetry={() => refetch()} />
  }

  if (!data?.data.length) {
    return <EmptyState title="No users found" description="Create your first user to get started" icon="user" />
  }

  return (
    <div className="bg-[#12121a] border border-[#2a2a3a] rounded-xl overflow-hidden">
      <table className="w-full">
        <thead className="bg-[#1a1a24]">
          <tr>
            <th className="px-4 py-3 text-left text-xs font-medium text-[#71717a] uppercase tracking-wider">ID</th>
            <th className="px-4 py-3 text-left text-xs font-medium text-[#71717a] uppercase tracking-wider">Username</th>
            <th className="px-4 py-3 text-left text-xs font-medium text-[#71717a] uppercase tracking-wider">Status</th>
            <th className="px-4 py-3 text-right text-xs font-medium text-[#71717a] uppercase tracking-wider">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-[#2a2a3a]">
          {data.data.map((user) => (
            <tr key={user.id} className="hover:bg-[#1a1a24] transition-colors">
              <td className="px-4 py-3 text-sm text-[#71717a]">{user.id}</td>
              <td className="px-4 py-3 text-sm text-[#e4e4e7]">{user.username}</td>
              <td className="px-4 py-3">
                <span className={`inline-flex px-2 py-1 text-xs rounded ${user.is_active ? 'bg-green-500/10 text-green-400' : 'bg-red-500/10 text-red-400'}`}>
                  {user.is_active ? 'Active' : 'Inactive'}
                </span>
              </td>
              <td className="px-4 py-3 text-right">
                <div className="flex items-center justify-end gap-2">
                  <Button variant="ghost" size="sm" onClick={() => onManageRoles(user)}>
                    Roles
                  </Button>
                  <Button variant="ghost" size="sm" onClick={() => onEdit(user)}>
                    Edit
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      if (confirm('Are you sure you want to delete this user?')) {
                        deleteMutation.mutate(user.id)
                      }
                    }}
                    disabled={deleteMutation.isPending}
                    className="text-red-400 hover:text-red-300"
                  >
                    Delete
                  </Button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      {data.meta && (
        <div className="px-4 py-3">
          <Pagination meta={data.meta} onPageChange={onPageChange} />
        </div>
      )}
    </div>
  )
}

function CreateUserModal({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const queryClient = useQueryClient()

  const mutation = useMutation({
    mutationFn: createUser,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] })
      onClose()
    },
  })

  const form = useForm({
    defaultValues: {
      username: '',
      password: '',
    },
    validators: {
      onChange: userCreateSchema,
    },
    onSubmit: async ({ value }) => {
      mutation.mutate(value)
    },
  })

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Create User">
      <form
        onSubmit={(e) => {
          e.preventDefault()
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
              error={typeof field.state.meta.errors?.[0] === 'string' ? field.state.meta.errors[0] : field.state.meta.errors?.[0]?.message}
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
              error={typeof field.state.meta.errors?.[0] === 'string' ? field.state.meta.errors[0] : field.state.meta.errors?.[0]?.message}
            />
          )}
        </form.Field>

        {mutation.isError && (
          <p className="text-sm text-red-500">
            {(mutation.error as Error)?.message || 'Failed to create user'}
          </p>
        )}

        <div className="flex justify-end gap-2 pt-2">
          <Button type="button" variant="secondary" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" isLoading={mutation.isPending}>
            Create
          </Button>
        </div>
      </form>
    </Modal>
  )
}

function EditUserModal({ user, onClose }: { user: User | null; onClose: () => void }) {
  const queryClient = useQueryClient()

  const mutation = useMutation({
    mutationFn: (data: { username?: string; password?: string }) =>
      updateUser(user!.id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] })
      onClose()
    },
  })

  const form = useForm({
    defaultValues: {
      username: user?.username || '',
      password: '',
    },
    onSubmit: async ({ value }) => {
      const data: { username?: string; password?: string } = {}
      if (value.username && value.username !== user?.username) {
        data.username = value.username
      }
      if (value.password) {
        data.password = value.password
      }
      if (Object.keys(data).length > 0) {
        mutation.mutate(data)
      } else {
        onClose()
      }
    },
  })

  if (!user) return null

  return (
    <Modal isOpen={!!user} onClose={onClose} title="Edit User">
      <form
        onSubmit={(e) => {
          e.preventDefault()
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
            />
          )}
        </form.Field>

        <form.Field name="password">
          {(field) => (
            <Input
              label="New Password (leave empty to keep current)"
              type="password"
              value={field.state.value}
              onChange={(e) => field.handleChange(e.target.value)}
            />
          )}
        </form.Field>

        {mutation.isError && (
          <p className="text-sm text-red-500">
            {(mutation.error as Error)?.message || 'Failed to update user'}
          </p>
        )}

        <div className="flex justify-end gap-2 pt-2">
          <Button type="button" variant="secondary" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" isLoading={mutation.isPending}>
            Save
          </Button>
        </div>
      </form>
    </Modal>
  )
}

function RoleManagementModal({ user, onClose }: { user: User | null; onClose: () => void }) {
  const queryClient = useQueryClient()
  const [selectedRole, setSelectedRole] = useState('')

  const { data: roles } = useQuery({
    queryKey: ['roles'],
    queryFn: getRoles,
    enabled: !!user,
  })

  const { data: userRoles, isLoading } = useQuery({
    queryKey: ['userRoles', user?.id],
    queryFn: () => getUserRoles(user!.id),
    enabled: !!user,
  })

  const assignMutation = useMutation({
    mutationFn: (roleName: string) => assignRole(user!.id, roleName),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['userRoles', user?.id] })
      setSelectedRole('')
    },
  })

  const removeMutation = useMutation({
    mutationFn: (roleName: string) => removeRole(user!.id, roleName),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['userRoles', user?.id] })
    },
  })

  if (!user) return null

  const userRoleNames = userRoles?.map((r: Role) => r.name) || []
  const availableRoles = roles?.filter((r: Role) => !userRoleNames.includes(r.name)) || []

  return (
    <Modal isOpen={!!user} onClose={onClose} title={`Manage Roles - ${user.username}`}>
      <div className="space-y-4">
        <div>
          <h4 className="text-sm font-medium text-[#e4e4e7] mb-2">Current Roles</h4>
          {isLoading ? (
            <LoadingSpinner size="sm" />
          ) : userRoles?.length ? (
            <div className="flex flex-wrap gap-2">
              {userRoles.map((role: Role) => (
                <span
                  key={role.id}
                  className="inline-flex items-center gap-1 px-3 py-1 bg-indigo-500/10 text-indigo-400 rounded-lg text-sm"
                >
                  {role.name}
                  <button
                    onClick={() => removeMutation.mutate(role.name)}
                    disabled={removeMutation.isPending}
                    className="hover:text-indigo-300 ml-1"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </span>
              ))}
            </div>
          ) : (
            <p className="text-sm text-[#71717a]">No roles assigned</p>
          )}
        </div>

        {availableRoles.length > 0 && (
          <div className="flex gap-2">
            <Select
              options={availableRoles.map((r: Role) => ({ value: r.name, label: r.name }))}
              value={selectedRole}
              onChange={(e) => setSelectedRole(e.target.value)}
              placeholder="Select a role"
              className="flex-1"
            />
            <Button
              onClick={() => selectedRole && assignMutation.mutate(selectedRole)}
              disabled={!selectedRole || assignMutation.isPending}
              isLoading={assignMutation.isPending}
            >
              Assign
            </Button>
          </div>
        )}

        <div className="flex justify-end pt-2">
          <Button variant="secondary" onClick={onClose}>
            Close
          </Button>
        </div>
      </div>
    </Modal>
  )
}

