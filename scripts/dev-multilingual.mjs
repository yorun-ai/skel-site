import {spawn} from 'node:child_process'
import {watch} from 'node:fs'
import {cp, mkdtemp, readdir, rm, symlink} from 'node:fs/promises'
import http from 'node:http'
import net from 'node:net'
import {tmpdir} from 'node:os'
import path from 'node:path'
import process from 'node:process'
import {fileURLToPath} from 'node:url'

const siteDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const siteName = path.basename(siteDir)
const docusaurusBin = path.join(
  siteDir,
  'node_modules',
  '@docusaurus',
  'core',
  'bin',
  'docusaurus.mjs',
)
const isolatedSiteExclusions = new Set([
  '.docusaurus',
  '.git',
  'build',
  'node_modules',
])

const parseOptions = (args) => {
  const options = {host: '127.0.0.1', port: 3000}

  for (let index = 0; index < args.length; index += 1) {
    const argument = args[index]

    if (argument === '--host' || argument === '--port') {
      const value = args[index + 1]
      if (!value) {
        throw new Error(`${argument} requires a value`)
      }
      options[argument.slice(2)] = value
      index += 1
      continue
    }

    if (argument.startsWith('--host=')) {
      options.host = argument.slice('--host='.length)
      continue
    }

    if (argument.startsWith('--port=')) {
      options.port = argument.slice('--port='.length)
      continue
    }

    throw new Error(`Unsupported option: ${argument}`)
  }

  const port = Number(options.port)
  if (!Number.isInteger(port) || port < 1 || port > 65_533) {
    throw new Error(`Invalid port: ${options.port}`)
  }

  return {...options, port}
}

const assertPortAvailable = (host, port) =>
  new Promise((resolve, reject) => {
    const server = net.createServer()

    server.once('error', (error) => {
      reject(
        new Error(
          `Port ${port} is unavailable on ${host}: ${error.message}`,
        ),
      )
    })
    server.listen(port, host, () => server.close(resolve))
  })

const createIsolatedSite = async (locale) => {
  const isolatedSiteDir = await mkdtemp(
    path.join(tmpdir(), `${siteName}-dev-${locale}-`),
  )
  const entries = await readdir(siteDir, {withFileTypes: true})

  await Promise.all(
    entries
      .filter((entry) => !isolatedSiteExclusions.has(entry.name))
      .map((entry) =>
        cp(
          path.join(siteDir, entry.name),
          path.join(isolatedSiteDir, entry.name),
          {force: true, recursive: true},
        ),
      ),
  )
  await symlink(
    path.join(siteDir, 'node_modules'),
    path.join(isolatedSiteDir, 'node_modules'),
    'dir',
  )

  return isolatedSiteDir
}

const shouldSyncSourcePath = (relativePath) => {
  const topLevelEntry = relativePath.split(path.sep)[0]
  return (
    relativePath.length > 0 &&
    !isolatedSiteExclusions.has(topLevelEntry)
  )
}

const syncSourcePath = async (relativePath, isolatedSiteDirs) => {
  if (!shouldSyncSourcePath(relativePath)) return

  const source = path.join(siteDir, relativePath)
  await Promise.all(
    isolatedSiteDirs.map(async (isolatedSiteDir) => {
      const destination = path.join(isolatedSiteDir, relativePath)
      try {
        await cp(source, destination, {force: true, recursive: true})
      } catch (error) {
        if (error.code !== 'ENOENT') throw error
        await rm(destination, {force: true, recursive: true})
      }
    }),
  )
}

const watchSource = (isolatedSiteDirs) => {
  const pendingSyncs = new Map()
  const watcher = watch(siteDir, {recursive: true}, (_eventType, filename) => {
    if (!filename) return
    const relativePath = filename.toString()
    if (!shouldSyncSourcePath(relativePath)) return

    clearTimeout(pendingSyncs.get(relativePath))
    pendingSyncs.set(
      relativePath,
      setTimeout(() => {
        pendingSyncs.delete(relativePath)
        void syncSourcePath(relativePath, isolatedSiteDirs).catch((error) => {
          console.error(
            `\nUnable to sync ${relativePath}: ${error.message}`,
          )
        })
      }, 40),
    )
  })

  return {
    close() {
      watcher.close()
      for (const timeout of pendingSyncs.values()) clearTimeout(timeout)
      pendingSyncs.clear()
    },
  }
}

const waitForPort = (port, children, timeoutMs = 60_000) =>
  new Promise((resolve, reject) => {
    const startedAt = Date.now()

    const tryConnect = () => {
      if (children.some((child) => child.exitCode !== null)) {
        reject(new Error(`Locale server on port ${port} exited during startup`))
        return
      }

      const socket = net.createConnection({host: '127.0.0.1', port})
      socket.once('connect', () => {
        socket.destroy()
        resolve()
      })
      socket.once('error', () => {
        socket.destroy()
        if (Date.now() - startedAt >= timeoutMs) {
          reject(new Error(`Timed out waiting for locale server on port ${port}`))
          return
        }
        setTimeout(tryConnect, 150)
      })
    }

    tryConnect()
  })

const proxyRequest = (request, response, targetPort) => {
  const upstream = http.request(
    {
      hostname: '127.0.0.1',
      port: targetPort,
      method: request.method,
      path: request.url,
      headers: request.headers,
    },
    (upstreamResponse) => {
      response.writeHead(
        upstreamResponse.statusCode ?? 502,
        upstreamResponse.headers,
      )
      upstreamResponse.pipe(response)
    },
  )

  upstream.on('error', (error) => {
    if (!response.headersSent) {
      response.writeHead(502, {'content-type': 'text/plain; charset=utf-8'})
    }
    response.end(`Development server unavailable: ${error.message}\n`)
  })
  request.pipe(upstream)
}

const proxyUpgrade = (request, socket, head, targetPort) => {
  const upstream = http.request({
    hostname: '127.0.0.1',
    port: targetPort,
    method: request.method,
    path: request.url,
    headers: request.headers,
  })

  upstream.once('upgrade', (upstreamResponse, upstreamSocket, upstreamHead) => {
    const statusLine = `HTTP/${upstreamResponse.httpVersion} 101 Switching Protocols`
    const headers = upstreamResponse.rawHeaders
      .reduce((lines, value, index, values) => {
        if (index % 2 === 0) {
          lines.push(`${value}: ${values[index + 1]}`)
        }
        return lines
      }, [])
      .join('\r\n')

    socket.write(`${statusLine}\r\n${headers}\r\n\r\n`)
    if (head.length > 0) upstreamSocket.write(head)
    if (upstreamHead.length > 0) socket.write(upstreamHead)
    socket.pipe(upstreamSocket).pipe(socket)
  })

  upstream.once('response', (upstreamResponse) => {
    socket.end(
      `HTTP/1.1 ${upstreamResponse.statusCode ?? 502} Bad Gateway\r\n\r\n`,
    )
  })
  upstream.once('error', () => socket.destroy())
  upstream.end()
}

const isChinesePath = (url = '') =>
  url === '/zh-CN' || url.startsWith('/zh-CN/')

const options = parseOptions(process.argv.slice(2))
const enPort = options.port + 1
const zhPort = options.port + 2
const children = []
const isolatedSiteDirs = []
let sourceWatcher
let shuttingDown = false

const shutdown = async (exitCode = 0) => {
  if (shuttingDown) return
  shuttingDown = true

  for (const child of children) {
    if (child.exitCode === null) child.kill('SIGTERM')
  }

  server?.close()
  sourceWatcher?.close()
  await new Promise((resolve) => setTimeout(resolve, 100))
  await Promise.all(
    isolatedSiteDirs.map((directory) =>
      rm(directory, {force: true, recursive: true}),
    ),
  )
  process.exit(exitCode)
}

let server

try {
  await Promise.all([
    assertPortAvailable(options.host, options.port),
    assertPortAvailable('127.0.0.1', enPort),
    assertPortAvailable('127.0.0.1', zhPort),
  ])

  for (const [locale, port] of [
    ['en', enPort],
    ['zh-CN', zhPort],
  ]) {
    const isolatedSiteDir = await createIsolatedSite(locale)
    isolatedSiteDirs.push(isolatedSiteDir)
    const child = spawn(
      process.execPath,
      [
        docusaurusBin,
        'start',
        '--locale',
        locale,
        '--host',
        '127.0.0.1',
        '--port',
        String(port),
        '--no-open',
      ],
      {
        cwd: isolatedSiteDir,
        env: {
          ...process.env,
          YORUN_DEV_LOCALE: locale,
          YORUN_MULTILINGUAL_DEV: '1',
        },
        stdio: 'inherit',
      },
    )
    children.push(child)

    child.once('exit', (code, signal) => {
      if (!shuttingDown) {
        console.error(
          `\n${locale} development server exited (${signal ?? `code ${code}`}).`,
        )
        void shutdown(code || 1)
      }
    })
  }

  sourceWatcher = watchSource(isolatedSiteDirs)

  await Promise.all([
    waitForPort(enPort, children),
    waitForPort(zhPort, children),
  ])

  server = http.createServer((request, response) => {
    const targetPort = isChinesePath(request.url) ? zhPort : enPort
    proxyRequest(request, response, targetPort)
  })
  server.on('upgrade', (request, socket, head) => {
    const targetPort = request.url?.startsWith('/__yorun_hmr_zh_CN')
      ? zhPort
      : enPort
    proxyUpgrade(request, socket, head, targetPort)
  })
  server.on('error', (error) => {
    console.error(`\nBilingual development proxy failed: ${error.message}`)
    void shutdown(1)
  })
  server.listen(options.port, options.host, () => {
    const displayHost =
      options.host === '0.0.0.0' || options.host === '::'
        ? 'localhost'
        : options.host
    console.log(
      `\nBilingual development server: http://${displayHost}:${options.port}/`,
    )
  })
} catch (error) {
  console.error(`\nUnable to start bilingual development server: ${error.message}`)
  void shutdown(1)
}

process.on('SIGINT', () => void shutdown(0))
process.on('SIGTERM', () => void shutdown(0))
