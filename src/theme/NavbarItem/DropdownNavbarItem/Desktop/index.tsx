import React, {
  type ReactNode,
  useEffect,
  useRef,
  useState,
} from 'react'
import clsx from 'clsx'
import {CaretDown, Tag} from '@phosphor-icons/react'
import {translate} from '@docusaurus/Translate'
import NavbarNavLink from '@theme/NavbarItem/NavbarNavLink'
import NavbarItem from '@theme/NavbarItem'
import type {Props} from '@theme/NavbarItem/DropdownNavbarItem/Desktop'

function ValueControl({
  icon,
  label,
}: {
  icon?: ReactNode
  label: ReactNode
}): ReactNode {
  return (
    <span className="navbar-control__content">
      {icon ? (
        <span aria-hidden="true" className="navbar-control__icon">
          {icon}
        </span>
      ) : null}
      <span className="navbar-control__value">{label}</span>
      <span className="navbar-control__chevron">
        <CaretDown aria-hidden="true" size={11} weight="bold" />
      </span>
    </span>
  )
}

export default function DropdownNavbarItemDesktop({
  items,
  position,
  className,
  onClick,
  ...props
}: Props): ReactNode {
  const dropdownRef = useRef<HTMLDivElement>(null)
  const [showDropdown, setShowDropdown] = useState(false)
  const controlType = className?.includes('navbar-control--version')
    ? 'version'
    : className?.includes('navbar-control--locale')
      ? 'locale'
      : null

  useEffect(() => {
    const handleClickOutside = (
      event: MouseEvent | TouchEvent | FocusEvent,
    ) => {
      if (
        !dropdownRef.current ||
        dropdownRef.current.contains(event.target as Node)
      ) {
        return
      }
      setShowDropdown(false)
    }

    document.addEventListener('mousedown', handleClickOutside)
    document.addEventListener('touchstart', handleClickOutside)
    document.addEventListener('focusin', handleClickOutside)

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
      document.removeEventListener('touchstart', handleClickOutside)
      document.removeEventListener('focusin', handleClickOutside)
    }
  }, [])

  const ariaLabel =
    controlType === 'version'
      ? translate({
          id: 'skel.navbar.versionSwitcher.ariaLabel',
          message: 'Select documentation version',
        })
      : controlType === 'locale'
        ? translate({
            id: 'skel.navbar.localeSwitcher.ariaLabel',
            message: 'Select language',
          })
        : undefined

  return (
    <div
      ref={dropdownRef}
      className={clsx('navbar__item', 'dropdown', {
        'dropdown--right': position === 'right',
        'dropdown--show': showDropdown,
        'navbar-control-dropdown': controlType,
        [`navbar-control-dropdown--${controlType}`]: controlType,
      })}>
      <NavbarNavLink
        {...props}
        label={
          controlType ? (
            <ValueControl
              icon={
                controlType === 'version' ? (
                  <Tag size={16} weight="regular" />
                ) : null
              }
              label={props.label}
            />
          ) : (
            props.children ?? props.label
          )
        }
        aria-label={ariaLabel}
        aria-haspopup="true"
        aria-expanded={showDropdown}
        role="button"
        href={props.to ? undefined : '#'}
        className={clsx('navbar__link', className)}
        onClick={(event) => {
          event.preventDefault()
          onClick?.(event)
          setShowDropdown((visible) => !visible)
        }}
        onKeyDown={(event) => {
          if (event.key === 'Enter' || event.key === ' ') {
            event.preventDefault()
            setShowDropdown((visible) => !visible)
          } else if (event.key === 'Escape') {
            setShowDropdown(false)
          }
        }}
      />
      <ul className="dropdown__menu">
        {items.map((childItemProps, index) => (
          <NavbarItem
            isDropdownItem
            activeClassName="dropdown__link--active"
            {...childItemProps}
            key={index}
          />
        ))}
      </ul>
    </div>
  )
}
