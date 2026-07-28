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
        'pagination-nav__link h-auto min-h-20 flex-1 flex-col items-stretch justify-center gap-1 px-4 py-3',
        isNext
          ? 'pagination-nav__link--next text-right'
          : 'pagination-nav__link--prev text-left',
        buttonVariants({variant: 'outline'}),
      )}
      to={permalink}>
      <span
        className={cn(
          'flex items-center gap-1 text-sm font-normal text-muted-foreground',
          isNext ? 'justify-end' : 'justify-start',
        )}>
        {!isNext && (
          <ArrowLeft
            aria-hidden="true"
            className="size-4"
            strokeWidth={1.75}
          />
        )}
        {subLabel && (
          <span>{subLabel}</span>
        )}
        {isNext && (
          <ArrowRight
            aria-hidden="true"
            className="size-4"
            strokeWidth={1.75}
          />
        )}
      </span>
      <span className="line-clamp-2 min-w-0 text-base font-normal leading-5 text-foreground">
        {title}
      </span>
    </Link>
  )
}
