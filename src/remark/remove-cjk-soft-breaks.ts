type MarkdownNode = {
  type?: string
  value?: string
  children?: MarkdownNode[]
}

const cjkCharacter = String.raw`[\p{Script=Han}\u3000-\u303f\uff00-\uff65]`
const cjkSoftBreak = new RegExp(
  `(${cjkCharacter})\\r?\\n[\\t ]*(?=${cjkCharacter})`,
  'gu',
)

function removeCjkSoftBreaks(node: MarkdownNode): void {
  if (node.type === 'text' && typeof node.value === 'string') {
    node.value = node.value.replace(cjkSoftBreak, '$1')
  }

  node.children?.forEach(removeCjkSoftBreaks)
}

export default function remarkRemoveCjkSoftBreaks() {
  return removeCjkSoftBreaks
}
