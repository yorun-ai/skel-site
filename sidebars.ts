import type {SidebarsConfig} from '@docusaurus/plugin-content-docs'

const category = (label: string, items: string[]) => ({
  type: 'category' as const,
  label,
  collapsed: false,
  link: {
    type: 'generated-index' as const,
    title: label,
  },
  items,
})

const sidebars: SidebarsConfig = {
  docsSidebar: [
    'index',
    category('Get Started', [
      'getting-started/overview',
      'getting-started/installation',
      'getting-started/quick-start',
      'getting-started/input-layout',
    ]),
    category('Skel Language', [
      'language/overview',
      'language/contract-design',
      'language/syntax',
    ]),
    category('Daily Tooling', [
      'tooling/workflow',
      'tooling/diagnostics',
      'tooling/editor',
    ]),
    category('Code Generation', [
      'generation/overview',
      'generation/go',
      'generation/typescript',
      'generation/public-contracts',
    ]),
    category('Vine Integration', [
      'integration/vine',
      'integration/runtime-types',
      'integration/compatibility',
    ]),
    category('Reference', [
      'reference/cli',
      'reference/troubleshooting',
      'reference/glossary',
    ]),
  ],
}

export default sidebars
