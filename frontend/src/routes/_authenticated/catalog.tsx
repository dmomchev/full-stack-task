import { createFileRoute } from '@tanstack/react-router'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useState } from 'react'
import { getBrands, getModels, getSubmodels, getGenerations, getCarSpecs, addToMyCars } from '../../api'
import { Button, Select, LoadingSpinner, ErrorMessage, EmptyState } from '../../components'
import type { Brand, Model, Submodel, Generation, CarSpec } from '../../types'

export const Route = createFileRoute('/_authenticated/catalog')({
  component: CatalogPage,
})

function CatalogPage() {
  const [selectedBrand, setSelectedBrand] = useState<number | null>(null)
  const [selectedModel, setSelectedModel] = useState<number | null>(null)
  const [selectedSubmodel, setSelectedSubmodel] = useState<number | null>(null)
  const [selectedGeneration, setSelectedGeneration] = useState<number | null>(null)
  const [expandedBrands, setExpandedBrands] = useState<Set<number>>(new Set())
  const [expandedModels, setExpandedModels] = useState<Set<number>>(new Set())
  const [expandedSubmodels, setExpandedSubmodels] = useState<Set<number>>(new Set())
  const [expandedGenerations, setExpandedGenerations] = useState<Set<number>>(new Set())

  // Load all brands for the tree view
  const { data: brands, isLoading: brandsLoading, isError: brandsError, refetch: refetchBrands } = useQuery({
    queryKey: ['brands', 'all'],
    queryFn: () => getBrands({ per_page: 100 }),
  })

  // For the filter dropdowns
  const { data: models } = useQuery({
    queryKey: ['models', selectedBrand, 'all'],
    queryFn: () => getModels(selectedBrand!, { per_page: 100 }),
    enabled: !!selectedBrand,
  })

  const { data: submodels } = useQuery({
    queryKey: ['submodels', selectedModel, 'all'],
    queryFn: () => getSubmodels(selectedModel!, { per_page: 100 }),
    enabled: !!selectedModel,
  })

  const { data: generations } = useQuery({
    queryKey: ['generations', selectedSubmodel, 'all'],
    queryFn: () => getGenerations(selectedSubmodel!, { per_page: 100 }),
    enabled: !!selectedSubmodel,
  })

  const { data: specs, isLoading: specsLoading } = useQuery({
    queryKey: ['specs', selectedGeneration, 'all'],
    queryFn: () => getCarSpecs(selectedGeneration!, { per_page: 100 }),
    enabled: !!selectedGeneration,
  })

  const resetFilters = () => {
    setSelectedBrand(null)
    setSelectedModel(null)
    setSelectedSubmodel(null)
    setSelectedGeneration(null)
  }

  const toggleBrand = (id: number) => {
    const next = new Set(expandedBrands)
    if (next.has(id)) next.delete(id)
    else next.add(id)
    setExpandedBrands(next)
  }

  const toggleModel = (id: number) => {
    const next = new Set(expandedModels)
    if (next.has(id)) next.delete(id)
    else next.add(id)
    setExpandedModels(next)
  }

  const toggleSubmodel = (id: number) => {
    const next = new Set(expandedSubmodels)
    if (next.has(id)) next.delete(id)
    else next.add(id)
    setExpandedSubmodels(next)
  }

  const toggleGeneration = (id: number) => {
    const next = new Set(expandedGenerations)
    if (next.has(id)) next.delete(id)
    else next.add(id)
    setExpandedGenerations(next)
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-[#e4e4e7]">Car Catalog</h1>

      {/* Filter Bar */}
      <div className="bg-[#12121a] border border-[#2a2a3a] rounded-xl p-4">
        <div className="flex gap-4 items-end flex-wrap">
          <div className="w-44">
            <Select
              label="Brand"
              options={brands?.data.map((b) => ({ value: b.id, label: b.name })) || []}
              value={selectedBrand?.toString() || ''}
              onChange={(e) => {
                setSelectedBrand(e.target.value ? parseInt(e.target.value) : null)
                setSelectedModel(null)
                setSelectedSubmodel(null)
                setSelectedGeneration(null)
              }}
              placeholder="All Brands"
            />
          </div>
          <div className="w-44">
            <Select
              label="Model"
              options={models?.data.map((m) => ({ value: m.id, label: m.name })) || []}
              value={selectedModel?.toString() || ''}
              onChange={(e) => {
                setSelectedModel(e.target.value ? parseInt(e.target.value) : null)
                setSelectedSubmodel(null)
                setSelectedGeneration(null)
              }}
              placeholder="All Models"
              disabled={!selectedBrand}
            />
          </div>
          <div className="w-44">
            <Select
              label="Submodel"
              options={submodels?.data.map((s) => ({ value: s.id, label: s.name })) || []}
              value={selectedSubmodel?.toString() || ''}
              onChange={(e) => {
                setSelectedSubmodel(e.target.value ? parseInt(e.target.value) : null)
                setSelectedGeneration(null)
              }}
              placeholder="All Submodels"
              disabled={!selectedModel}
            />
          </div>
          <div className="w-44">
            <Select
              label="Generation"
              options={generations?.data.map((g) => ({ value: g.id, label: `${g.name} (${g.year_start}-${g.year_end})` })) || []}
              value={selectedGeneration?.toString() || ''}
              onChange={(e) => setSelectedGeneration(e.target.value ? parseInt(e.target.value) : null)}
              placeholder="All Generations"
              disabled={!selectedSubmodel}
            />
          </div>
          {(selectedBrand || selectedModel || selectedSubmodel || selectedGeneration) && (
            <Button variant="ghost" size="sm" onClick={resetFilters}>
              Clear Filters
            </Button>
          )}
        </div>
      </div>

      {/* Content */}
      {brandsLoading ? (
        <LoadingSpinner className="py-12" />
      ) : brandsError ? (
        <ErrorMessage message="Failed to load catalog" onRetry={() => refetchBrands()} />
      ) : !brands?.data.length ? (
        <EmptyState title="No cars in catalog" description="No brands available yet" icon="car" />
      ) : selectedGeneration ? (
        // Show specs when generation is selected
        <div>
          <h2 className="text-lg font-semibold text-[#e4e4e7] mb-4">Specifications</h2>
          {specsLoading ? (
            <LoadingSpinner className="py-8" />
          ) : !specs?.data.length ? (
            <EmptyState title="No specifications" description="No specs available for this generation" icon="car" />
          ) : (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {specs.data.map((spec) => (
                <SpecCard key={spec.id} spec={spec} />
              ))}
            </div>
          )}
        </div>
      ) : (
        // Show tree view
        <div className="bg-[#12121a] border border-[#2a2a3a] rounded-xl overflow-hidden">
          <div className="p-4 border-b border-[#2a2a3a]">
            <h2 className="text-sm font-medium text-[#71717a]">Browse by hierarchy</h2>
          </div>
          <div className="p-2">
            {(selectedBrand ? brands.data.filter(b => b.id === selectedBrand) : brands.data).map((brand) => (
              <BrandNode
                key={brand.id}
                brand={brand}
                isExpanded={expandedBrands.has(brand.id)}
                onToggle={() => toggleBrand(brand.id)}
                expandedModels={expandedModels}
                onToggleModel={toggleModel}
                expandedSubmodels={expandedSubmodels}
                onToggleSubmodel={toggleSubmodel}
                expandedGenerations={expandedGenerations}
                onToggleGeneration={toggleGeneration}
                filterModel={selectedModel}
                filterSubmodel={selectedSubmodel}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

function BrandNode({ 
  brand, 
  isExpanded, 
  onToggle, 
  expandedModels, 
  onToggleModel,
  expandedSubmodels,
  onToggleSubmodel,
  expandedGenerations,
  onToggleGeneration,
  filterModel,
  filterSubmodel,
}: { 
  brand: Brand
  isExpanded: boolean
  onToggle: () => void
  expandedModels: Set<number>
  onToggleModel: (id: number) => void
  expandedSubmodels: Set<number>
  onToggleSubmodel: (id: number) => void
  expandedGenerations: Set<number>
  onToggleGeneration: (id: number) => void
  filterModel: number | null
  filterSubmodel: number | null
}) {
  const { data: models } = useQuery({
    queryKey: ['models', brand.id, 'all'],
    queryFn: () => getModels(brand.id, { per_page: 100 }),
    enabled: isExpanded,
  })

  return (
    <div className="mb-1">
      <button
        onClick={onToggle}
        className="w-full flex items-center gap-2 px-3 py-2 text-left rounded-lg hover:bg-[#1a1a24] transition-colors"
      >
        <ChevronIcon isExpanded={isExpanded} />
        <span className="text-[#e4e4e7] font-medium">{brand.name}</span>
      </button>
      {isExpanded && models?.data && (
        <div className="ml-4 border-l border-[#2a2a3a] pl-2">
          {(filterModel ? models.data.filter(m => m.id === filterModel) : models.data).map((model) => (
            <ModelNode
              key={model.id}
              model={model}
              isExpanded={expandedModels.has(model.id)}
              onToggle={() => onToggleModel(model.id)}
              expandedSubmodels={expandedSubmodels}
              onToggleSubmodel={onToggleSubmodel}
              expandedGenerations={expandedGenerations}
              onToggleGeneration={onToggleGeneration}
              filterSubmodel={filterSubmodel}
            />
          ))}
        </div>
      )}
    </div>
  )
}

function ModelNode({ 
  model, 
  isExpanded, 
  onToggle,
  expandedSubmodels,
  onToggleSubmodel,
  expandedGenerations,
  onToggleGeneration,
  filterSubmodel,
}: { 
  model: Model
  isExpanded: boolean
  onToggle: () => void
  expandedSubmodels: Set<number>
  onToggleSubmodel: (id: number) => void
  expandedGenerations: Set<number>
  onToggleGeneration: (id: number) => void
  filterSubmodel: number | null
}) {
  const { data: submodels } = useQuery({
    queryKey: ['submodels', model.id, 'all'],
    queryFn: () => getSubmodels(model.id, { per_page: 100 }),
    enabled: isExpanded,
  })

  return (
    <div className="mb-1">
      <button
        onClick={onToggle}
        className="w-full flex items-center gap-2 px-3 py-2 text-left rounded-lg hover:bg-[#1a1a24] transition-colors"
      >
        <ChevronIcon isExpanded={isExpanded} />
        <span className="text-[#e4e4e7]">{model.name}</span>
      </button>
      {isExpanded && submodels?.data && (
        <div className="ml-4 border-l border-[#2a2a3a] pl-2">
          {(filterSubmodel ? submodels.data.filter(s => s.id === filterSubmodel) : submodels.data).map((submodel) => (
            <SubmodelNode
              key={submodel.id}
              submodel={submodel}
              isExpanded={expandedSubmodels.has(submodel.id)}
              onToggle={() => onToggleSubmodel(submodel.id)}
              expandedGenerations={expandedGenerations}
              onToggleGeneration={onToggleGeneration}
            />
          ))}
        </div>
      )}
    </div>
  )
}

function SubmodelNode({ 
  submodel, 
  isExpanded, 
  onToggle,
  expandedGenerations,
  onToggleGeneration,
}: { 
  submodel: Submodel
  isExpanded: boolean
  onToggle: () => void
  expandedGenerations: Set<number>
  onToggleGeneration: (id: number) => void
}) {
  const { data: generations } = useQuery({
    queryKey: ['generations', submodel.id, 'all'],
    queryFn: () => getGenerations(submodel.id, { per_page: 100 }),
    enabled: isExpanded,
  })

  return (
    <div className="mb-1">
      <button
        onClick={onToggle}
        className="w-full flex items-center gap-2 px-3 py-2 text-left rounded-lg hover:bg-[#1a1a24] transition-colors"
      >
        <ChevronIcon isExpanded={isExpanded} />
        <span className="text-[#71717a]">{submodel.name}</span>
      </button>
      {isExpanded && generations?.data && (
        <div className="ml-4 border-l border-[#2a2a3a] pl-2">
          {generations.data.map((generation) => (
            <GenerationNode
              key={generation.id}
              generation={generation}
              isExpanded={expandedGenerations.has(generation.id)}
              onToggle={() => onToggleGeneration(generation.id)}
            />
          ))}
        </div>
      )}
    </div>
  )
}

function GenerationNode({ 
  generation, 
  isExpanded, 
  onToggle,
}: { 
  generation: Generation
  isExpanded: boolean
  onToggle: () => void
}) {
  const { data: specs, isLoading } = useQuery({
    queryKey: ['specs', generation.id, 'all'],
    queryFn: () => getCarSpecs(generation.id, { per_page: 100 }),
    enabled: isExpanded,
  })

  return (
    <div className="mb-1">
      <button
        onClick={onToggle}
        className="w-full flex items-center gap-2 px-3 py-2 text-left rounded-lg hover:bg-[#1a1a24] transition-colors"
      >
        <ChevronIcon isExpanded={isExpanded} />
        <span className="text-[#71717a]">{generation.name}</span>
        <span className="text-xs text-[#52525b]">({generation.year_start}-{generation.year_end})</span>
      </button>
      {isExpanded && (
        <div className="ml-4 pl-2 py-2">
          {isLoading ? (
            <LoadingSpinner size="sm" />
          ) : !specs?.data.length ? (
            <p className="text-sm text-[#71717a] px-3">No specifications</p>
          ) : (
            <div className="grid gap-3">
              {specs.data.map((spec) => (
                <SpecCard key={spec.id} spec={spec} compact />
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  )
}

function SpecCard({ spec, compact = false }: { spec: CarSpec; compact?: boolean }) {
  const queryClient = useQueryClient()
  const [added, setAdded] = useState(false)

  const addMutation = useMutation({
    mutationFn: () => addToMyCars(spec.id),
    onSuccess: () => {
      setAdded(true)
      queryClient.invalidateQueries({ queryKey: ['my-cars'] })
    },
  })

  if (compact) {
    return (
      <div className="bg-[#1a1a24] border border-[#2a2a3a] rounded-lg p-3 flex items-center justify-between">
        <div>
          <h4 className="text-sm font-medium text-[#e4e4e7]">{spec.name}</h4>
          <p className="text-xs text-[#71717a]">{spec.engine} • {spec.horsepower}hp • {spec.fuel_type}</p>
        </div>
        <Button
          variant={added ? 'secondary' : 'primary'}
          size="sm"
          onClick={() => addMutation.mutate()}
          disabled={addMutation.isPending || added}
        >
          {added ? 'Added' : 'Add'}
        </Button>
      </div>
    )
  }

  return (
    <div className="bg-[#12121a] border border-[#2a2a3a] rounded-xl p-4 hover:border-[#3a3a4a] transition-colors">
      <h3 className="text-lg font-semibold text-[#e4e4e7] mb-3">{spec.name}</h3>
      <div className="space-y-2 text-sm mb-4">
        <div className="flex justify-between">
          <span className="text-[#71717a]">Engine</span>
          <span className="text-[#e4e4e7]">{spec.engine}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-[#71717a]">Power</span>
          <span className="text-[#e4e4e7]">{spec.horsepower} hp</span>
        </div>
        <div className="flex justify-between">
          <span className="text-[#71717a]">Torque</span>
          <span className="text-[#e4e4e7]">{spec.torque} Nm</span>
        </div>
        <div className="flex justify-between">
          <span className="text-[#71717a]">Fuel</span>
          <span className="text-[#e4e4e7]">{spec.fuel_type}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-[#71717a]">Year</span>
          <span className="text-[#e4e4e7]">{spec.year}</span>
        </div>
      </div>
      <Button
        variant={added ? 'secondary' : 'primary'}
        className="w-full"
        onClick={() => addMutation.mutate()}
        disabled={addMutation.isPending || added}
        isLoading={addMutation.isPending}
      >
        {added ? 'Added to My Cars' : 'Add to My Cars'}
      </Button>
    </div>
  )
}

function ChevronIcon({ isExpanded }: { isExpanded: boolean }) {
  return (
    <svg
      className={`w-4 h-4 text-[#71717a] transition-transform ${isExpanded ? 'rotate-90' : ''}`}
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
    >
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
    </svg>
  )
}

