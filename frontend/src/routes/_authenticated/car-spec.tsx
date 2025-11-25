import { createFileRoute, Navigate } from '@tanstack/react-router'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useForm } from '@tanstack/react-form'
import { useState } from 'react'
import { useAuth } from '../../store/auth'
import {
  getBrands, createBrand, updateBrand, deleteBrand,
  getModels, createModel, updateModel, deleteModel,
  getSubmodels, createSubmodel, updateSubmodel, deleteSubmodel,
  getGenerations, createGeneration, updateGeneration, deleteGeneration,
  getCarSpecs, createCarSpec, updateCarSpec, deleteCarSpec,
} from '../../api'
import { brandSchema, modelSchema, submodelSchema, generationSchema, carSpecSchema } from '../../schemas'
import { Button, Input, Select, Modal, LoadingSpinner, ErrorMessage, EmptyState, Pagination } from '../../components'
import type { Brand, Model, Submodel, Generation, CarSpec } from '../../types'

export const Route = createFileRoute('/_authenticated/car-spec')({
  component: CarSpecPage,
})

type Tab = 'brands' | 'models' | 'submodels' | 'generations' | 'specs'

function CarSpecPage() {
  const { user } = useAuth()
  const [activeTab, setActiveTab] = useState<Tab>('brands')
  const [selectedBrand, setSelectedBrand] = useState<number | null>(null)
  const [selectedModel, setSelectedModel] = useState<number | null>(null)
  const [selectedSubmodel, setSelectedSubmodel] = useState<number | null>(null)
  const [selectedGeneration, setSelectedGeneration] = useState<number | null>(null)

  if (user?.role !== 'Admin' && user?.role !== 'CarSpec') {
    return <Navigate to="/" />
  }

  const tabs: { id: Tab; label: string }[] = [
    { id: 'brands', label: 'Brands' },
    { id: 'models', label: 'Models' },
    { id: 'submodels', label: 'Submodels' },
    { id: 'generations', label: 'Generations' },
    { id: 'specs', label: 'Specifications' },
  ]

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-[#e4e4e7]">Car Specifications</h1>

      <div className="flex gap-1 border-b border-[#2a2a3a]">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`px-4 py-2 text-sm font-medium transition-colors border-b-2 -mb-px ${
              activeTab === tab.id
                ? 'text-indigo-400 border-indigo-400'
                : 'text-[#71717a] border-transparent hover:text-[#e4e4e7]'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {activeTab === 'brands' && <BrandsTab />}
      {activeTab === 'models' && (
        <ModelsTab
          selectedBrand={selectedBrand}
          onBrandChange={setSelectedBrand}
        />
      )}
      {activeTab === 'submodels' && (
        <SubmodelsTab
          selectedBrand={selectedBrand}
          onBrandChange={setSelectedBrand}
          selectedModel={selectedModel}
          onModelChange={setSelectedModel}
        />
      )}
      {activeTab === 'generations' && (
        <GenerationsTab
          selectedBrand={selectedBrand}
          onBrandChange={setSelectedBrand}
          selectedModel={selectedModel}
          onModelChange={setSelectedModel}
          selectedSubmodel={selectedSubmodel}
          onSubmodelChange={setSelectedSubmodel}
        />
      )}
      {activeTab === 'specs' && (
        <SpecsTab
          selectedBrand={selectedBrand}
          onBrandChange={setSelectedBrand}
          selectedModel={selectedModel}
          onModelChange={setSelectedModel}
          selectedSubmodel={selectedSubmodel}
          onSubmodelChange={setSelectedSubmodel}
          selectedGeneration={selectedGeneration}
          onGenerationChange={setSelectedGeneration}
        />
      )}
    </div>
  )
}

// Helper to check if user can delete an item
function canDelete(userRole: string | null | undefined, userId: number | undefined, itemCreatedBy: number): boolean {
  if (userRole === 'Admin') return true
  return userId === itemCreatedBy
}

// Brands Tab
function BrandsTab() {
  const { user } = useAuth()
  const queryClient = useQueryClient()
  const [page, setPage] = useState(1)
  const [isCreateOpen, setIsCreateOpen] = useState(false)
  const [editing, setEditing] = useState<Brand | null>(null)

  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ['brands', page],
    queryFn: () => getBrands({ page, per_page: 10 }),
  })

  const deleteMutation = useMutation({
    mutationFn: deleteBrand,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['brands'] }),
  })

  if (isLoading) return <LoadingSpinner className="py-12" />
  if (isError) return <ErrorMessage message="Failed to load brands" onRetry={() => refetch()} />

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <Button onClick={() => setIsCreateOpen(true)}>Add Brand</Button>
      </div>

      {!data?.data.length ? (
        <EmptyState title="No brands found" description="Create your first brand" />
      ) : (
        <div className="bg-[#12121a] border border-[#2a2a3a] rounded-xl overflow-hidden">
          <table className="w-full">
            <thead className="bg-[#1a1a24]">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-[#71717a] uppercase">ID</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-[#71717a] uppercase">Name</th>
                <th className="px-4 py-3 text-right text-xs font-medium text-[#71717a] uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#2a2a3a]">
              {data.data.map((brand) => (
                <tr key={brand.id} className="hover:bg-[#1a1a24]">
                  <td className="px-4 py-3 text-sm text-[#71717a]">{brand.id}</td>
                  <td className="px-4 py-3 text-sm text-[#e4e4e7]">{brand.name}</td>
                  <td className="px-4 py-3 text-right">
                    {canDelete(user?.role, user?.id, brand.created_by) && (
                      <>
                        <Button variant="ghost" size="sm" onClick={() => setEditing(brand)}>Edit</Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-red-400"
                          onClick={() => confirm('Delete this brand?') && deleteMutation.mutate(brand.id)}
                        >
                          Delete
                        </Button>
                      </>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {data.meta && <div className="px-4 py-3"><Pagination meta={data.meta} onPageChange={setPage} /></div>}
        </div>
      )}

      <BrandModal isOpen={isCreateOpen} onClose={() => setIsCreateOpen(false)} />
      <BrandModal brand={editing} isOpen={!!editing} onClose={() => setEditing(null)} />
    </div>
  )
}

function BrandModal({ brand, isOpen, onClose }: { brand?: Brand | null; isOpen: boolean; onClose: () => void }) {
  const queryClient = useQueryClient()
  const isEdit = !!brand

  const mutation = useMutation({
    mutationFn: (data: { name: string }) => isEdit ? updateBrand(brand!.id, data) : createBrand(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['brands'] })
      onClose()
    },
  })

  const form = useForm({
    defaultValues: { name: brand?.name || '' },
    validators: { onChange: brandSchema },
    onSubmit: ({ value }) => mutation.mutate(value),
  })

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={isEdit ? 'Edit Brand' : 'Create Brand'}>
      <form onSubmit={(e) => { e.preventDefault(); form.handleSubmit() }} className="space-y-4">
        <form.Field name="name">
          {(field) => (
            <Input label="Name" value={field.state.value} onChange={(e) => field.handleChange(e.target.value)} error={typeof field.state.meta.errors?.[0] === 'string' ? field.state.meta.errors[0] : field.state.meta.errors?.[0]?.message} />
          )}
        </form.Field>
        <div className="flex justify-end gap-2">
          <Button type="button" variant="secondary" onClick={onClose}>Cancel</Button>
          <Button type="submit" isLoading={mutation.isPending}>{isEdit ? 'Save' : 'Create'}</Button>
        </div>
      </form>
    </Modal>
  )
}

// Models Tab
function ModelsTab({ selectedBrand, onBrandChange }: { selectedBrand: number | null; onBrandChange: (id: number | null) => void }) {
  const { user } = useAuth()
  const queryClient = useQueryClient()
  const [page, setPage] = useState(1)
  const [isCreateOpen, setIsCreateOpen] = useState(false)
  const [editing, setEditing] = useState<Model | null>(null)

  const { data: brands } = useQuery({ queryKey: ['brands', 'all'], queryFn: () => getBrands({ per_page: 100 }) })
  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ['models', selectedBrand, page],
    queryFn: () => getModels(selectedBrand!, { page, per_page: 10 }),
    enabled: !!selectedBrand,
  })

  const deleteMutation = useMutation({
    mutationFn: (modelId: number) => deleteModel(selectedBrand!, modelId),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['models'] }),
  })

  return (
    <div className="space-y-4">
      <div className="flex gap-4 items-end">
        <div className="w-64">
          <Select
            label="Select Brand"
            options={brands?.data.map((b) => ({ value: b.id, label: b.name })) || []}
            value={selectedBrand?.toString() || ''}
            onChange={(e) => onBrandChange(e.target.value ? parseInt(e.target.value) : null)}
            placeholder="Choose a brand"
          />
        </div>
        {selectedBrand && <Button onClick={() => setIsCreateOpen(true)}>Add Model</Button>}
      </div>

      {!selectedBrand ? (
        <EmptyState title="Select a brand" description="Choose a brand to view its models" />
      ) : isLoading ? (
        <LoadingSpinner className="py-12" />
      ) : isError ? (
        <ErrorMessage message="Failed to load models" onRetry={() => refetch()} />
      ) : !data?.data.length ? (
        <EmptyState title="No models found" description="Create your first model" />
      ) : (
        <div className="bg-[#12121a] border border-[#2a2a3a] rounded-xl overflow-hidden">
          <table className="w-full">
            <thead className="bg-[#1a1a24]">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-[#71717a] uppercase">ID</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-[#71717a] uppercase">Name</th>
                <th className="px-4 py-3 text-right text-xs font-medium text-[#71717a] uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#2a2a3a]">
              {data.data.map((model) => (
                <tr key={model.id} className="hover:bg-[#1a1a24]">
                  <td className="px-4 py-3 text-sm text-[#71717a]">{model.id}</td>
                  <td className="px-4 py-3 text-sm text-[#e4e4e7]">{model.name}</td>
                  <td className="px-4 py-3 text-right">
                    {canDelete(user?.role, user?.id, model.created_by) && (
                      <>
                        <Button variant="ghost" size="sm" onClick={() => setEditing(model)}>Edit</Button>
                        <Button variant="ghost" size="sm" className="text-red-400" onClick={() => confirm('Delete?') && deleteMutation.mutate(model.id)}>Delete</Button>
                      </>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {data.meta && <div className="px-4 py-3"><Pagination meta={data.meta} onPageChange={setPage} /></div>}
        </div>
      )}

      <ModelModal brandId={selectedBrand} isOpen={isCreateOpen} onClose={() => setIsCreateOpen(false)} />
      <ModelModal brandId={selectedBrand} model={editing} isOpen={!!editing} onClose={() => setEditing(null)} />
    </div>
  )
}

function ModelModal({ brandId, model, isOpen, onClose }: { brandId: number | null; model?: Model | null; isOpen: boolean; onClose: () => void }) {
  const queryClient = useQueryClient()
  const isEdit = !!model

  const mutation = useMutation({
    mutationFn: (data: { name: string }) => isEdit ? updateModel(brandId!, model!.id, data) : createModel(brandId!, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['models'] })
      onClose()
    },
  })

  const form = useForm({
    defaultValues: { name: model?.name || '' },
    validators: { onChange: modelSchema },
    onSubmit: ({ value }) => mutation.mutate(value),
  })

  if (!brandId) return null

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={isEdit ? 'Edit Model' : 'Create Model'}>
      <form onSubmit={(e) => { e.preventDefault(); form.handleSubmit() }} className="space-y-4">
        <form.Field name="name">
          {(field) => <Input label="Name" value={field.state.value} onChange={(e) => field.handleChange(e.target.value)} error={typeof field.state.meta.errors?.[0] === 'string' ? field.state.meta.errors[0] : field.state.meta.errors?.[0]?.message} />}
        </form.Field>
        <div className="flex justify-end gap-2">
          <Button type="button" variant="secondary" onClick={onClose}>Cancel</Button>
          <Button type="submit" isLoading={mutation.isPending}>{isEdit ? 'Save' : 'Create'}</Button>
        </div>
      </form>
    </Modal>
  )
}

// Submodels Tab
function SubmodelsTab({ selectedBrand, onBrandChange, selectedModel, onModelChange }: {
  selectedBrand: number | null; onBrandChange: (id: number | null) => void
  selectedModel: number | null; onModelChange: (id: number | null) => void
}) {
  const { user } = useAuth()
  const queryClient = useQueryClient()
  const [page, setPage] = useState(1)
  const [isCreateOpen, setIsCreateOpen] = useState(false)
  const [editing, setEditing] = useState<Submodel | null>(null)

  const { data: brands } = useQuery({ queryKey: ['brands', 'all'], queryFn: () => getBrands({ per_page: 100 }) })
  const { data: models } = useQuery({
    queryKey: ['models', selectedBrand, 'all'],
    queryFn: () => getModels(selectedBrand!, { per_page: 100 }),
    enabled: !!selectedBrand,
  })
  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ['submodels', selectedModel, page],
    queryFn: () => getSubmodels(selectedModel!, { page, per_page: 10 }),
    enabled: !!selectedModel,
  })

  const deleteMutation = useMutation({
    mutationFn: (submodelId: number) => deleteSubmodel(selectedModel!, submodelId),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['submodels'] }),
  })

  return (
    <div className="space-y-4">
      <div className="flex gap-4 items-end flex-wrap">
        <div className="w-48">
          <Select label="Brand" options={brands?.data.map((b) => ({ value: b.id, label: b.name })) || []} value={selectedBrand?.toString() || ''} onChange={(e) => { onBrandChange(e.target.value ? parseInt(e.target.value) : null); onModelChange(null) }} placeholder="Choose brand" />
        </div>
        <div className="w-48">
          <Select label="Model" options={models?.data.map((m) => ({ value: m.id, label: m.name })) || []} value={selectedModel?.toString() || ''} onChange={(e) => onModelChange(e.target.value ? parseInt(e.target.value) : null)} placeholder="Choose model" disabled={!selectedBrand} />
        </div>
        {selectedModel && <Button onClick={() => setIsCreateOpen(true)}>Add Submodel</Button>}
      </div>

      {!selectedModel ? (
        <EmptyState title="Select brand and model" description="Choose a brand and model to view submodels" />
      ) : isLoading ? (
        <LoadingSpinner className="py-12" />
      ) : isError ? (
        <ErrorMessage message="Failed to load submodels" onRetry={() => refetch()} />
      ) : !data?.data.length ? (
        <EmptyState title="No submodels found" description="Create your first submodel" />
      ) : (
        <div className="bg-[#12121a] border border-[#2a2a3a] rounded-xl overflow-hidden">
          <table className="w-full">
            <thead className="bg-[#1a1a24]">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-[#71717a] uppercase">ID</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-[#71717a] uppercase">Name</th>
                <th className="px-4 py-3 text-right text-xs font-medium text-[#71717a] uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#2a2a3a]">
              {data.data.map((submodel) => (
                <tr key={submodel.id} className="hover:bg-[#1a1a24]">
                  <td className="px-4 py-3 text-sm text-[#71717a]">{submodel.id}</td>
                  <td className="px-4 py-3 text-sm text-[#e4e4e7]">{submodel.name}</td>
                  <td className="px-4 py-3 text-right">
                    {canDelete(user?.role, user?.id, submodel.created_by) && (
                      <>
                        <Button variant="ghost" size="sm" onClick={() => setEditing(submodel)}>Edit</Button>
                        <Button variant="ghost" size="sm" className="text-red-400" onClick={() => confirm('Delete?') && deleteMutation.mutate(submodel.id)}>Delete</Button>
                      </>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {data.meta && <div className="px-4 py-3"><Pagination meta={data.meta} onPageChange={setPage} /></div>}
        </div>
      )}

      <SubmodelModal modelId={selectedModel} isOpen={isCreateOpen} onClose={() => setIsCreateOpen(false)} />
      <SubmodelModal modelId={selectedModel} submodel={editing} isOpen={!!editing} onClose={() => setEditing(null)} />
    </div>
  )
}

function SubmodelModal({ modelId, submodel, isOpen, onClose }: { modelId: number | null; submodel?: Submodel | null; isOpen: boolean; onClose: () => void }) {
  const queryClient = useQueryClient()
  const isEdit = !!submodel

  const mutation = useMutation({
    mutationFn: (data: { name: string }) => isEdit ? updateSubmodel(modelId!, submodel!.id, data) : createSubmodel(modelId!, data),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['submodels'] }); onClose() },
  })

  const form = useForm({
    defaultValues: { name: submodel?.name || '' },
    validators: { onChange: submodelSchema },
    onSubmit: ({ value }) => mutation.mutate(value),
  })

  if (!modelId) return null

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={isEdit ? 'Edit Submodel' : 'Create Submodel'}>
      <form onSubmit={(e) => { e.preventDefault(); form.handleSubmit() }} className="space-y-4">
        <form.Field name="name">
          {(field) => <Input label="Name" value={field.state.value} onChange={(e) => field.handleChange(e.target.value)} error={typeof field.state.meta.errors?.[0] === 'string' ? field.state.meta.errors[0] : field.state.meta.errors?.[0]?.message} />}
        </form.Field>
        <div className="flex justify-end gap-2">
          <Button type="button" variant="secondary" onClick={onClose}>Cancel</Button>
          <Button type="submit" isLoading={mutation.isPending}>{isEdit ? 'Save' : 'Create'}</Button>
        </div>
      </form>
    </Modal>
  )
}

// Generations Tab
function GenerationsTab({ selectedBrand, onBrandChange, selectedModel, onModelChange, selectedSubmodel, onSubmodelChange }: {
  selectedBrand: number | null; onBrandChange: (id: number | null) => void
  selectedModel: number | null; onModelChange: (id: number | null) => void
  selectedSubmodel: number | null; onSubmodelChange: (id: number | null) => void
}) {
  const { user } = useAuth()
  const queryClient = useQueryClient()
  const [page, setPage] = useState(1)
  const [isCreateOpen, setIsCreateOpen] = useState(false)
  const [editing, setEditing] = useState<Generation | null>(null)

  const { data: brands } = useQuery({ queryKey: ['brands', 'all'], queryFn: () => getBrands({ per_page: 100 }) })
  const { data: models } = useQuery({ queryKey: ['models', selectedBrand, 'all'], queryFn: () => getModels(selectedBrand!, { per_page: 100 }), enabled: !!selectedBrand })
  const { data: submodels } = useQuery({ queryKey: ['submodels', selectedModel, 'all'], queryFn: () => getSubmodels(selectedModel!, { per_page: 100 }), enabled: !!selectedModel })
  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ['generations', selectedSubmodel, page],
    queryFn: () => getGenerations(selectedSubmodel!, { page, per_page: 10 }),
    enabled: !!selectedSubmodel,
  })

  const deleteMutation = useMutation({
    mutationFn: (genId: number) => deleteGeneration(selectedSubmodel!, genId),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['generations'] }),
  })

  return (
    <div className="space-y-4">
      <div className="flex gap-4 items-end flex-wrap">
        <div className="w-44">
          <Select label="Brand" options={brands?.data.map((b) => ({ value: b.id, label: b.name })) || []} value={selectedBrand?.toString() || ''} onChange={(e) => { onBrandChange(e.target.value ? parseInt(e.target.value) : null); onModelChange(null); onSubmodelChange(null) }} placeholder="Brand" />
        </div>
        <div className="w-44">
          <Select label="Model" options={models?.data.map((m) => ({ value: m.id, label: m.name })) || []} value={selectedModel?.toString() || ''} onChange={(e) => { onModelChange(e.target.value ? parseInt(e.target.value) : null); onSubmodelChange(null) }} placeholder="Model" disabled={!selectedBrand} />
        </div>
        <div className="w-44">
          <Select label="Submodel" options={submodels?.data.map((s) => ({ value: s.id, label: s.name })) || []} value={selectedSubmodel?.toString() || ''} onChange={(e) => onSubmodelChange(e.target.value ? parseInt(e.target.value) : null)} placeholder="Submodel" disabled={!selectedModel} />
        </div>
        {selectedSubmodel && <Button onClick={() => setIsCreateOpen(true)}>Add Generation</Button>}
      </div>

      {!selectedSubmodel ? (
        <EmptyState title="Select hierarchy" description="Choose brand, model, and submodel" />
      ) : isLoading ? (
        <LoadingSpinner className="py-12" />
      ) : isError ? (
        <ErrorMessage message="Failed to load" onRetry={() => refetch()} />
      ) : !data?.data.length ? (
        <EmptyState title="No generations" description="Create first generation" />
      ) : (
        <div className="bg-[#12121a] border border-[#2a2a3a] rounded-xl overflow-hidden">
          <table className="w-full">
            <thead className="bg-[#1a1a24]">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-[#71717a] uppercase">ID</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-[#71717a] uppercase">Name</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-[#71717a] uppercase">Years</th>
                <th className="px-4 py-3 text-right text-xs font-medium text-[#71717a] uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#2a2a3a]">
              {data.data.map((gen) => (
                <tr key={gen.id} className="hover:bg-[#1a1a24]">
                  <td className="px-4 py-3 text-sm text-[#71717a]">{gen.id}</td>
                  <td className="px-4 py-3 text-sm text-[#e4e4e7]">{gen.name}</td>
                  <td className="px-4 py-3 text-sm text-[#71717a]">{gen.year_start} - {gen.year_end}</td>
                  <td className="px-4 py-3 text-right">
                    {canDelete(user?.role, user?.id, gen.created_by) && (
                      <>
                        <Button variant="ghost" size="sm" onClick={() => setEditing(gen)}>Edit</Button>
                        <Button variant="ghost" size="sm" className="text-red-400" onClick={() => confirm('Delete?') && deleteMutation.mutate(gen.id)}>Delete</Button>
                      </>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {data.meta && <div className="px-4 py-3"><Pagination meta={data.meta} onPageChange={setPage} /></div>}
        </div>
      )}

      <GenerationModal submodelId={selectedSubmodel} isOpen={isCreateOpen} onClose={() => setIsCreateOpen(false)} />
      <GenerationModal submodelId={selectedSubmodel} generation={editing} isOpen={!!editing} onClose={() => setEditing(null)} />
    </div>
  )
}

function GenerationModal({ submodelId, generation, isOpen, onClose }: { submodelId: number | null; generation?: Generation | null; isOpen: boolean; onClose: () => void }) {
  const queryClient = useQueryClient()
  const isEdit = !!generation

  const mutation = useMutation({
    mutationFn: (data: { name: string; year_start: number; year_end: number }) => 
      isEdit ? updateGeneration(submodelId!, generation!.id, data) : createGeneration(submodelId!, data),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['generations'] }); onClose() },
  })

  const form = useForm({
    defaultValues: { name: generation?.name || '', year_start: generation?.year_start || 2020, year_end: generation?.year_end || 2024 },
    validators: { onChange: generationSchema },
    onSubmit: ({ value }) => mutation.mutate(value),
  })

  if (!submodelId) return null

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={isEdit ? 'Edit Generation' : 'Create Generation'}>
      <form onSubmit={(e) => { e.preventDefault(); form.handleSubmit() }} className="space-y-4">
        <form.Field name="name">
          {(field) => <Input label="Name" value={field.state.value} onChange={(e) => field.handleChange(e.target.value)} error={typeof field.state.meta.errors?.[0] === 'string' ? field.state.meta.errors[0] : field.state.meta.errors?.[0]?.message} />}
        </form.Field>
        <div className="grid grid-cols-2 gap-4">
          <form.Field name="year_start">
            {(field) => <Input label="Year Start" type="number" value={field.state.value} onChange={(e) => field.handleChange(parseInt(e.target.value) || 0)} error={typeof field.state.meta.errors?.[0] === 'string' ? field.state.meta.errors[0] : field.state.meta.errors?.[0]?.message} />}
          </form.Field>
          <form.Field name="year_end">
            {(field) => <Input label="Year End" type="number" value={field.state.value} onChange={(e) => field.handleChange(parseInt(e.target.value) || 0)} error={typeof field.state.meta.errors?.[0] === 'string' ? field.state.meta.errors[0] : field.state.meta.errors?.[0]?.message} />}
          </form.Field>
        </div>
        <div className="flex justify-end gap-2">
          <Button type="button" variant="secondary" onClick={onClose}>Cancel</Button>
          <Button type="submit" isLoading={mutation.isPending}>{isEdit ? 'Save' : 'Create'}</Button>
        </div>
      </form>
    </Modal>
  )
}

// Specs Tab
function SpecsTab({ selectedBrand, onBrandChange, selectedModel, onModelChange, selectedSubmodel, onSubmodelChange, selectedGeneration, onGenerationChange }: {
  selectedBrand: number | null; onBrandChange: (id: number | null) => void
  selectedModel: number | null; onModelChange: (id: number | null) => void
  selectedSubmodel: number | null; onSubmodelChange: (id: number | null) => void
  selectedGeneration: number | null; onGenerationChange: (id: number | null) => void
}) {
  const { user } = useAuth()
  const queryClient = useQueryClient()
  const [page, setPage] = useState(1)
  const [isCreateOpen, setIsCreateOpen] = useState(false)
  const [editing, setEditing] = useState<CarSpec | null>(null)

  const { data: brands } = useQuery({ queryKey: ['brands', 'all'], queryFn: () => getBrands({ per_page: 100 }) })
  const { data: models } = useQuery({ queryKey: ['models', selectedBrand, 'all'], queryFn: () => getModels(selectedBrand!, { per_page: 100 }), enabled: !!selectedBrand })
  const { data: submodels } = useQuery({ queryKey: ['submodels', selectedModel, 'all'], queryFn: () => getSubmodels(selectedModel!, { per_page: 100 }), enabled: !!selectedModel })
  const { data: generations } = useQuery({ queryKey: ['generations', selectedSubmodel, 'all'], queryFn: () => getGenerations(selectedSubmodel!, { per_page: 100 }), enabled: !!selectedSubmodel })
  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ['specs', selectedGeneration, page],
    queryFn: () => getCarSpecs(selectedGeneration!, { page, per_page: 10 }),
    enabled: !!selectedGeneration,
  })

  const deleteMutation = useMutation({
    mutationFn: (specId: number) => deleteCarSpec(selectedGeneration!, specId),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['specs'] }),
  })

  return (
    <div className="space-y-4">
      <div className="flex gap-3 items-end flex-wrap">
        <div className="w-40">
          <Select label="Brand" options={brands?.data.map((b) => ({ value: b.id, label: b.name })) || []} value={selectedBrand?.toString() || ''} onChange={(e) => { onBrandChange(e.target.value ? parseInt(e.target.value) : null); onModelChange(null); onSubmodelChange(null); onGenerationChange(null) }} placeholder="Brand" />
        </div>
        <div className="w-40">
          <Select label="Model" options={models?.data.map((m) => ({ value: m.id, label: m.name })) || []} value={selectedModel?.toString() || ''} onChange={(e) => { onModelChange(e.target.value ? parseInt(e.target.value) : null); onSubmodelChange(null); onGenerationChange(null) }} placeholder="Model" disabled={!selectedBrand} />
        </div>
        <div className="w-40">
          <Select label="Submodel" options={submodels?.data.map((s) => ({ value: s.id, label: s.name })) || []} value={selectedSubmodel?.toString() || ''} onChange={(e) => { onSubmodelChange(e.target.value ? parseInt(e.target.value) : null); onGenerationChange(null) }} placeholder="Submodel" disabled={!selectedModel} />
        </div>
        <div className="w-40">
          <Select label="Generation" options={generations?.data.map((g) => ({ value: g.id, label: g.name })) || []} value={selectedGeneration?.toString() || ''} onChange={(e) => onGenerationChange(e.target.value ? parseInt(e.target.value) : null)} placeholder="Generation" disabled={!selectedSubmodel} />
        </div>
        {selectedGeneration && <Button onClick={() => setIsCreateOpen(true)}>Add Spec</Button>}
      </div>

      {!selectedGeneration ? (
        <EmptyState title="Select full hierarchy" description="Choose brand, model, submodel, and generation" />
      ) : isLoading ? (
        <LoadingSpinner className="py-12" />
      ) : isError ? (
        <ErrorMessage message="Failed to load" onRetry={() => refetch()} />
      ) : !data?.data.length ? (
        <EmptyState title="No specifications" description="Create first spec" icon="car" />
      ) : (
        <div className="bg-[#12121a] border border-[#2a2a3a] rounded-xl overflow-hidden">
          <table className="w-full">
            <thead className="bg-[#1a1a24]">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-[#71717a] uppercase">Name</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-[#71717a] uppercase">Engine</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-[#71717a] uppercase">HP</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-[#71717a] uppercase">Torque</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-[#71717a] uppercase">Fuel</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-[#71717a] uppercase">Year</th>
                <th className="px-4 py-3 text-right text-xs font-medium text-[#71717a] uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#2a2a3a]">
              {data.data.map((spec) => (
                <tr key={spec.id} className="hover:bg-[#1a1a24]">
                  <td className="px-4 py-3 text-sm text-[#e4e4e7]">{spec.name}</td>
                  <td className="px-4 py-3 text-sm text-[#71717a]">{spec.engine}</td>
                  <td className="px-4 py-3 text-sm text-[#71717a]">{spec.horsepower}</td>
                  <td className="px-4 py-3 text-sm text-[#71717a]">{spec.torque} Nm</td>
                  <td className="px-4 py-3 text-sm text-[#71717a]">{spec.fuel_type}</td>
                  <td className="px-4 py-3 text-sm text-[#71717a]">{spec.year}</td>
                  <td className="px-4 py-3 text-right">
                    {canDelete(user?.role, user?.id, spec.created_by) && (
                      <>
                        <Button variant="ghost" size="sm" onClick={() => setEditing(spec)}>Edit</Button>
                        <Button variant="ghost" size="sm" className="text-red-400" onClick={() => confirm('Delete?') && deleteMutation.mutate(spec.id)}>Delete</Button>
                      </>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {data.meta && <div className="px-4 py-3"><Pagination meta={data.meta} onPageChange={setPage} /></div>}
        </div>
      )}

      <SpecModal generationId={selectedGeneration} isOpen={isCreateOpen} onClose={() => setIsCreateOpen(false)} />
      <SpecModal generationId={selectedGeneration} spec={editing} isOpen={!!editing} onClose={() => setEditing(null)} />
    </div>
  )
}

function SpecModal({ generationId, spec, isOpen, onClose }: { generationId: number | null; spec?: CarSpec | null; isOpen: boolean; onClose: () => void }) {
  const queryClient = useQueryClient()
  const isEdit = !!spec

  const mutation = useMutation({
    mutationFn: (data: { name: string; engine: string; horsepower: number; torque: number; fuel_type: string; year: number }) =>
      isEdit ? updateCarSpec(generationId!, spec!.id, data) : createCarSpec(generationId!, data),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['specs'] }); onClose() },
  })

  const form = useForm({
    defaultValues: {
      name: spec?.name || '',
      engine: spec?.engine || '',
      horsepower: spec?.horsepower || 0,
      torque: spec?.torque || 0,
      fuel_type: spec?.fuel_type || '',
      year: spec?.year || new Date().getFullYear(),
    },
    validators: { onChange: carSpecSchema },
    onSubmit: ({ value }) => mutation.mutate(value),
  })

  if (!generationId) return null

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={isEdit ? 'Edit Specification' : 'Create Specification'}>
      <form onSubmit={(e) => { e.preventDefault(); form.handleSubmit() }} className="space-y-4">
        <form.Field name="name">
          {(field) => <Input label="Name" value={field.state.value} onChange={(e) => field.handleChange(e.target.value)} error={typeof field.state.meta.errors?.[0] === 'string' ? field.state.meta.errors[0] : field.state.meta.errors?.[0]?.message} />}
        </form.Field>
        <form.Field name="engine">
          {(field) => <Input label="Engine" value={field.state.value} onChange={(e) => field.handleChange(e.target.value)} error={typeof field.state.meta.errors?.[0] === 'string' ? field.state.meta.errors[0] : field.state.meta.errors?.[0]?.message} placeholder="e.g., 2.0L Turbo" />}
        </form.Field>
        <div className="grid grid-cols-2 gap-4">
          <form.Field name="horsepower">
            {(field) => <Input label="Horsepower" type="number" value={field.state.value} onChange={(e) => field.handleChange(parseInt(e.target.value) || 0)} error={typeof field.state.meta.errors?.[0] === 'string' ? field.state.meta.errors[0] : field.state.meta.errors?.[0]?.message} />}
          </form.Field>
          <form.Field name="torque">
            {(field) => <Input label="Torque (Nm)" type="number" value={field.state.value} onChange={(e) => field.handleChange(parseInt(e.target.value) || 0)} error={typeof field.state.meta.errors?.[0] === 'string' ? field.state.meta.errors[0] : field.state.meta.errors?.[0]?.message} />}
          </form.Field>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <form.Field name="fuel_type">
            {(field) => <Input label="Fuel Type" value={field.state.value} onChange={(e) => field.handleChange(e.target.value)} error={typeof field.state.meta.errors?.[0] === 'string' ? field.state.meta.errors[0] : field.state.meta.errors?.[0]?.message} placeholder="e.g., Petrol, Diesel" />}
          </form.Field>
          <form.Field name="year">
            {(field) => <Input label="Year" type="number" value={field.state.value} onChange={(e) => field.handleChange(parseInt(e.target.value) || 0)} error={typeof field.state.meta.errors?.[0] === 'string' ? field.state.meta.errors[0] : field.state.meta.errors?.[0]?.message} />}
          </form.Field>
        </div>
        <div className="flex justify-end gap-2">
          <Button type="button" variant="secondary" onClick={onClose}>Cancel</Button>
          <Button type="submit" isLoading={mutation.isPending}>{isEdit ? 'Save' : 'Create'}</Button>
        </div>
      </form>
    </Modal>
  )
}

