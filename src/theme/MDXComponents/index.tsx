import React, {useId, type ComponentProps, type ReactNode} from 'react'
import Translate from '@docusaurus/Translate'
import MDXComponents from '@theme-original/MDXComponents'

function ResponsiveTable(props: ComponentProps<'table'>): ReactNode {
  const labelId = useId()

  return (
    <div
      aria-labelledby={labelId}
      className="docs-table-scroll"
      role="region"
      tabIndex={0}>
      <span className="docs-table-scroll__label" id={labelId}>
        <Translate
          id="theme.MDXComponents.Table.scrollRegionLabel"
          description="The accessible label for a horizontally scrollable Markdown table">
          Scrollable table
        </Translate>
      </span>
      <table {...props} />
    </div>
  )
}

export default {
  ...MDXComponents,
  table: ResponsiveTable,
}
