import {cp, mkdtemp, rm, symlink} from 'node:fs/promises'
import {tmpdir} from 'node:os'
import path from 'node:path'
import {spawn} from 'node:child_process'
import {fileURLToPath} from 'node:url'

const scriptDir = path.dirname(fileURLToPath(import.meta.url))
const projectDir = path.resolve(scriptDir, '..')
const temporarySiteDir = await mkdtemp(
  path.join(tmpdir(), `${path.basename(projectDir)}-build-`),
)
const excludedTopLevelEntries = new Set([
  '.docusaurus',
  '.git',
  'build',
  'node_modules',
])

const shouldCopy = (source) => {
  const relativePath = path.relative(projectDir, source)
  const topLevelEntry = relativePath.split(path.sep)[0]
  return !excludedTopLevelEntries.has(topLevelEntry)
}

const runBuild = () =>
  new Promise((resolve, reject) => {
    const docusaurusBin = path.join(
      projectDir,
      'node_modules',
      '@docusaurus',
      'core',
      'bin',
      'docusaurus.mjs',
    )
    const child = spawn(
      process.execPath,
      [
        docusaurusBin,
        'build',
        '--out-dir',
        path.join(projectDir, 'build'),
      ],
      {
        cwd: temporarySiteDir,
        env: process.env,
        stdio: 'inherit',
      },
    )

    child.once('error', reject)
    child.once('exit', (code, signal) => {
      if (signal) {
        reject(new Error(`Docusaurus build terminated by ${signal}`))
      } else {
        resolve(code ?? 1)
      }
    })
  })

let exitCode = 1

try {
  await cp(projectDir, temporarySiteDir, {
    filter: shouldCopy,
    recursive: true,
  })
  await symlink(
    path.join(projectDir, 'node_modules'),
    path.join(temporarySiteDir, 'node_modules'),
    'dir',
  )
  exitCode = await runBuild()
} finally {
  await rm(temporarySiteDir, {force: true, recursive: true})
}

process.exitCode = exitCode
