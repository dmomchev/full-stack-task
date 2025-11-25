import { Button } from './Button'
import type { PageMeta } from '../types'

interface PaginationProps {
  meta: PageMeta
  onPageChange: (page: number) => void
}

export function Pagination({ meta, onPageChange }: PaginationProps) {
  const { page, total_pages } = meta

  if (total_pages <= 1) return null

  return (
    <div className="flex items-center justify-between pt-4 border-t border-[#2a2a3a]">
      <p className="text-sm text-[#71717a]">
        Page {page} of {total_pages}
      </p>
      <div className="flex gap-2">
        <Button
          variant="secondary"
          size="sm"
          onClick={() => onPageChange(page - 1)}
          disabled={page <= 1}
        >
          Previous
        </Button>
        <Button
          variant="secondary"
          size="sm"
          onClick={() => onPageChange(page + 1)}
          disabled={page >= total_pages}
        >
          Next
        </Button>
      </div>
    </div>
  )
}

