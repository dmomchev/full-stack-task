import { createFileRoute, Navigate } from '@tanstack/react-router'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useState } from 'react'
import { useAuth } from '../../store/auth'
import { getMyCars, removeFromMyCars } from '../../api'
import { Button, LoadingSpinner, ErrorMessage, EmptyState, Pagination } from '../../components'
import type { CarSpec } from '../../types'

export const Route = createFileRoute('/_authenticated/my-cars')({
  component: MyCarsPage,
})

function MyCarsPage() {
  const { user } = useAuth()
  const queryClient = useQueryClient()
  const [page, setPage] = useState(1)

  // Check if user has my_cars permission (Admin or User role)
  if (user?.role !== 'Admin' && user?.role !== 'User') {
    return <Navigate to="/" />
  }

  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ['my-cars', page],
    queryFn: () => getMyCars({ page, per_page: 12 }),
  })

  const removeMutation = useMutation({
    mutationFn: removeFromMyCars,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['my-cars'] })
    },
  })

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-[#e4e4e7]">My Cars</h1>
        {data?.meta && (
          <span className="text-sm text-[#71717a]">
            {data.meta.total_items} car{data.meta.total_items !== 1 ? 's' : ''} saved
          </span>
        )}
      </div>

      {isLoading ? (
        <LoadingSpinner className="py-12" />
      ) : isError ? (
        <ErrorMessage message="Failed to load your cars" onRetry={() => refetch()} />
      ) : !data?.data.length ? (
        <EmptyState 
          title="No cars saved yet" 
          description="Browse the catalog and add cars to your collection" 
          icon="car" 
        />
      ) : (
        <>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {data.data.map((spec: CarSpec) => (
              <CarCard
                key={spec.id}
                spec={spec}
                onRemove={() => removeMutation.mutate(spec.id)}
                isRemoving={removeMutation.isPending}
              />
            ))}
          </div>

          {data.meta && (
            <Pagination meta={data.meta} onPageChange={setPage} />
          )}
        </>
      )}
    </div>
  )
}

function CarCard({ 
  spec, 
  onRemove, 
  isRemoving 
}: { 
  spec: CarSpec
  onRemove: () => void
  isRemoving: boolean 
}) {
  return (
    <div className="bg-[#12121a] border border-[#2a2a3a] rounded-xl p-5 hover:border-[#3a3a4a] transition-colors">
      <div className="flex items-start justify-between mb-4">
        <h3 className="text-lg font-semibold text-[#e4e4e7]">{spec.name}</h3>
        <span className="px-2 py-1 bg-indigo-500/10 text-indigo-400 rounded text-xs font-medium">
          {spec.year}
        </span>
      </div>

      <div className="space-y-3 mb-5">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-[#1a1a24] flex items-center justify-center">
            <svg className="w-4 h-4 text-[#71717a]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
          </div>
          <div>
            <p className="text-xs text-[#71717a]">Engine</p>
            <p className="text-sm text-[#e4e4e7]">{spec.engine}</p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="bg-[#1a1a24] rounded-lg p-3">
            <p className="text-xs text-[#71717a] mb-1">Power</p>
            <p className="text-lg font-semibold text-[#e4e4e7]">{spec.horsepower}<span className="text-sm text-[#71717a] ml-1">hp</span></p>
          </div>
          <div className="bg-[#1a1a24] rounded-lg p-3">
            <p className="text-xs text-[#71717a] mb-1">Torque</p>
            <p className="text-lg font-semibold text-[#e4e4e7]">{spec.torque}<span className="text-sm text-[#71717a] ml-1">Nm</span></p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="px-2 py-1 bg-[#1a1a24] border border-[#2a2a3a] rounded text-xs text-[#71717a]">
            {spec.fuel_type}
          </span>
        </div>
      </div>

      <Button
        variant="danger"
        className="w-full"
        onClick={onRemove}
        disabled={isRemoving}
        isLoading={isRemoving}
      >
        Remove from My Cars
      </Button>
    </div>
  )
}

