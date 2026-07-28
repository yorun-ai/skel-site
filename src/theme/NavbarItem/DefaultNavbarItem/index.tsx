import React, {type ReactNode} from 'react'
import {GithubLogoIcon, Tag} from '@phosphor-icons/react'
import {translate} from '@docusaurus/Translate'
import OriginalDefaultNavbarItem from '@theme-original/NavbarItem/DefaultNavbarItem'
import type {Props} from '@theme/NavbarItem/DefaultNavbarItem'

export default function DefaultNavbarItem(props: Props): ReactNode {
  if (!props.mobile && props.className?.includes('navbar-control--version')) {
    const versionProps = {
      ...props,
      'aria-label': translate({
        id: 'skel.navbar.versionSwitcher.ariaLabel',
        message: 'Documentation version',
      }),
      label: (
        <span className="navbar-control__content">
          <span aria-hidden="true" className="navbar-control__icon">
            <Tag size={16} weight="regular" />
          </span>
          <span className="navbar-control__value">{props.label}</span>
        </span>
      ),
    } as unknown as Props

    return <OriginalDefaultNavbarItem {...versionProps} />
  }

  if (props.mobile || !props.className?.includes('navbar-github-link')) {
    return <OriginalDefaultNavbarItem {...props} />
  }

  const githubProps = {
    ...props,
    'aria-label': 'GitHub',
    label: (
      <GithubLogoIcon
        aria-hidden="true"
        className="navbar-github-icon"
        size={16}
        weight="fill"
      />
    ),
  } as unknown as Props

  return <OriginalDefaultNavbarItem {...githubProps} />
}
