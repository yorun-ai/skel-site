import path from 'node:path'
import {fileURLToPath} from 'node:url'
import type {Plugin} from '@docusaurus/types'

const sourceDirectory = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  '..',
)

export default function aliasesPlugin(): Plugin<void> {
  return {
    name: 'skel-site-aliases',
    configureWebpack() {
      return {
        resolve: {
          alias: {
            '@': sourceDirectory,
          },
        },
      }
    },
  }
}
