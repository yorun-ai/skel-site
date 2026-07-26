import React, {type ReactNode} from 'react'
import Link from '@docusaurus/Link'
import type {Props} from '@theme/PaginatorNavLink'
import {ArrowLeft, ArrowRight} from 'lucide-react'

import {buttonVariants} from '@/components/ui/button'
import {cn} from '@/lib/utils'

export default function PaginatorNavLink({
  permalink,
  title,
  subLabel,
  isNext,
}: Props): ReactNode {
  return (
    <Link
      className={cn(
        'pagination-nav__link group h-auto min-h-20 flex-1 items-center gap-3 px-4 py-3',
        isNext
          ? 'pagination-nav__link--next justify-end text-right'
          : 'pagination-nav__link--prev justify-start text-left',
        buttonVariants({variant: 'outline'}),
      )}
      to={permalink}>
      {!isNext && (
        <ArrowLeft
          aria-hidden="true"
          className="text-muted-foreground transition-transform group-hover:-translate-x-0.5"
        />
      )}
      <span className="min-w-0">
        {subLabel && (
          <span className="block text-xs font-medium text-muted-foreground">
            {subLabel}
          </span>
        )}
        <span className="mt-1 block truncate text-sm font-semibold text-foreground">
          {title}
        </span>
      </span>
      {isNext && (
        <ArrowRight
          aria-hidden="true"
          className="text-muted-foreground transition-transform group-hover:translate-x-0.5"
        />
      )}
    </Link>
  )
}
