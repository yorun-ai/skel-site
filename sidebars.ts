import type {SidebarsConfig} from '@docusaurus/plugin-content-docs'

const category = (
  label: string,
  items: string[],
  collapsed: boolean = true,
) => ({
  type: 'category' as const,
  label,
  collapsed,
  items,
})

const sidebars: SidebarsConfig = {
  docsSidebar: [
    'index',
    category(
      'Start Here',
      [
        'getting-started/overview',
        'getting-started/installation',
        'getting-started/quick-start',
        'getting-started/input-layout',
      ],
      false,
    ),
    category('Design Contracts', [
      'language/overview',
      'language/files-and-imports',
      'language/types-and-data',
      'language/actors-and-access',
      'language/permissions',
      'language/services',
      'language/events-and-tasks',
      'language/metadata',
      'language/contract-design',
    ]),
    category('Use the Toolchain', [
      'tooling/workflow',
      'tooling/diagnostics',
      'tooling/editor',
    ]),
    category('Generate Code', [
      'generation/overview',
      'generation/go',
      'generation/typescript',
      'generation/public-contracts',
    ]),
    category('Use with Vine', [
      'integration/vine',
      'integration/runtime-types',
      'integration/compatibility',
    ]),
    category('Reference', [
      'language/syntax',
      'reference/cli',
      'reference/troubleshooting',
      'reference/glossary',
    ]),
  ],
}

export default sidebars
