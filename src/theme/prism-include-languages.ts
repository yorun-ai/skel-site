import {registerSkelPrism} from '@yorun-ai/skel-highlight/prism'
import type {PrismLib} from 'prism-react-renderer'
import includeOriginalLanguages from '@theme-original/prism-include-languages'

export default function includeLanguages(prism: PrismLib): void {
  includeOriginalLanguages(prism)
  registerSkelPrism(prism)
}
