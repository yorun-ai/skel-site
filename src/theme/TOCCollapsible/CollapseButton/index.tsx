import React, {type ReactNode} from 'react'
import clsx from 'clsx'
import {CaretDown} from '@phosphor-icons/react'
import Translate from '@docusaurus/Translate'
import type {Props} from '@theme/TOCCollapsible/CollapseButton'

import styles from './styles.module.css'

export default function TOCCollapsibleCollapseButton({
  collapsed,
  ...props
}: Props): ReactNode {
  return (
    <button
      {...props}
      className={clsx('clean-btn', styles.button, props.className)}
      type="button">
      <Translate
        id="theme.TOCCollapsible.toggleButtonLabel"
        description="The label used by the button on the collapsible TOC component">
        On this page
      </Translate>
      <CaretDown
        aria-hidden="true"
        className={clsx(styles.icon, !collapsed && styles.iconExpanded)}
        size={16}
        weight="regular"
      />
    </button>
  )
}
