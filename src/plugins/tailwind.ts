import tailwindcss from '@tailwindcss/postcss'
import type {LoadContext, Plugin} from '@docusaurus/types'

type PostCssOptions = {
  plugins: unknown[]
}

export default function tailwindPlugin(
  _context: LoadContext,
  _options: unknown,
): Plugin<void> {
  return {
    name: 'skel-site-tailwind',
    configurePostCss(postcssOptions: PostCssOptions) {
      postcssOptions.plugins.push(tailwindcss())
      return postcssOptions
    },
  }
}
