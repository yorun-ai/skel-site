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
    category('开始使用', [
      'getting-started/overview',
      'getting-started/installation',
      'getting-started/quick-start',
      'getting-started/input-layout',
    ]),
    category('Skel 语言', [
      'language/overview',
      'language/contract-design',
      'language/syntax',
    ]),
    category('日常工具', [
      'tooling/workflow',
      'tooling/diagnostics',
      'tooling/editor',
    ]),
    category('代码生成', [
      'generation/overview',
      'generation/go',
      'generation/typescript',
      'generation/public-contracts',
    ]),
    category('Vine 集成', [
      'integration/vine',
      'integration/runtime-types',
      'integration/compatibility',
    ]),
    category('参考', [
      'reference/cli',
      'reference/troubleshooting',
      'reference/glossary',
    ]),
  ],
}

export default sidebars
