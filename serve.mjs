import { createServer } from 'node:http'
import { createReadStream, statSync } from 'node:fs'
import { join, normalize, extname } from 'node:path'

const ROOT = process.argv[2]
const PORT = Number(process.argv[3])
const ORIGIN = process.argv[4]

const types = {
  '.html': 'text/html; charset=utf-8', '.js': 'text/javascript; charset=utf-8', '.mjs': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8', '.json': 'application/json; charset=utf-8', '.svg': 'image/svg+xml',
  '.png': 'image/png', '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg', '.gif': 'image/gif', '.webp': 'image/webp',
  '.avif': 'image/avif', '.mp4': 'video/mp4', '.webm': 'video/webm', '.woff': 'font/woff', '.woff2': 'font/woff2',
  '.ttf': 'font/ttf', '.ico': 'image/x-icon', '.txt': 'text/plain; charset=utf-8', '.map': 'application/json',
}

createServer(async (req, res) => {
  try {
    let pathname = decodeURIComponent(new URL(req.url || '/', 'http://localhost').pathname)
    if (pathname === '/' || pathname === '') pathname = '/index.html'
    const safe = join(ROOT, normalize(pathname).replace(/^(\.[/\\])+/, ''))
    try {
      const st = statSync(safe)
      if (st.isDirectory()) { res.writeHead(301, { Location: pathname.replace(/\/?$/, '/') }); res.end(); return }
      res.writeHead(200, { 'content-type': types[extname(safe).toLowerCase()] || 'application/octet-stream' })
      createReadStream(safe).pipe(res)
      return
    } catch {
      // not on disk -> proxy to the original site
    }
    const upstream = new URL(req.url, ORIGIN).href
    const headers = {}
    for (const h of ['user-agent', 'accept', 'accept-language', 'content-type', 'referer', 'origin', 'cookie']) {
      const v = req.headers[h]
      if (v) headers[h] = v
    }
    let body
    if (req.method === 'POST') {
      body = await new Promise((resolve) => {
        const chunks = []
        req.on('data', (c) => chunks.push(c))
        req.on('end', () => resolve(Buffer.concat(chunks)))
      })
    }
    const r = await fetch(upstream, {
      method: req.method,
      headers,
      body: body && body.length ? body : undefined,
      redirect: 'follow',
      signal: AbortSignal.timeout(30000),
    })
    const buf = Buffer.from(await r.arrayBuffer())
    res.writeHead(r.status, { 'content-type': r.headers.get('content-type') || 'application/octet-stream' })
    res.end(buf)
  } catch {
    res.writeHead(502)
    res.end('proxy error')
  }
}).listen(PORT, '127.0.0.1', () => console.log('static replica (bloxpad.io) on http://127.0.0.1:' + PORT))
