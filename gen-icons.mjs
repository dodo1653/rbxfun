// Generates favicon.png (64x64) and apple-touch-icon.png (180x180) — green brick mark
import { writeFileSync } from 'node:fs'
import { deflateSync } from 'node:zlib'

function crc32(buf) {
  let c, table = []
  for (let n = 0; n < 256; n++) { c = n; for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1; table[n] = c >>> 0 }
  let crc = 0xffffffff
  for (const b of buf) crc = table[(crc ^ b) & 0xff] ^ (crc >>> 8)
  return (crc ^ 0xffffffff) >>> 0
}
function chunk(type, data) {
  const len = Buffer.alloc(4); len.writeUInt32BE(data.length)
  const body = Buffer.concat([Buffer.from(type), data])
  const crc = Buffer.alloc(4); crc.writeUInt32BE(crc32(body))
  return Buffer.concat([len, body, crc])
}
function png(w, h, pixelFn) {
  const ihdr = Buffer.alloc(13)
  ihdr.writeUInt32BE(w, 0); ihdr.writeUInt32BE(h, 4)
  ihdr[8] = 8; ihdr[9] = 6 // 8-bit RGBA
  const raw = Buffer.alloc(h * (1 + w * 4))
  let p = 0
  for (let y = 0; y < h; y++) {
    raw[p++] = 0
    for (let x = 0; x < w; x++) {
      const [r, g, b, a] = pixelFn(x, y)
      raw[p++] = r; raw[p++] = g; raw[p++] = b; raw[p++] = a
    }
  }
  return Buffer.concat([
    Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]),
    chunk('IHDR', ihdr),
    chunk('IDAT', deflateSync(raw)),
    chunk('IEND', Buffer.alloc(0)),
  ])
}

// rounded-rect test + brick layout (matches favicon.svg)
const inBrick = (x, y, s) => x >= 0.18 * s && x <= 0.82 * s && y >= 0.12 * s && y <= 0.88 * s
function brickPixel(x, y, s) {
  const u = x / s, v = y / s
  // outer rounded rect with border
  const rx = 0.10, ry = 0.12, rw = 0.64, rh = 0.76, rad = 0.10
  const cx = Math.max(rx + rad, Math.min(u, rx + rw - rad))
  const cy = Math.max(ry + rad, Math.min(v, ry + rh - rad))
  const dist = Math.hypot(u - cx, v - cy)
  if (dist > rad) return [0, 0, 0, 0] // transparent outside
  const border = dist > rad - 0.055
  if (border) return [0x0b, 0x6b, 0x2d, 255] // dark green border
  // inner slots
  const slot = (x0, y0, ww, hh, col) => u >= x0 && u <= x0 + ww && v >= y0 && v <= y0 + hh ? col : null
  const light = [0xee, 0xf2, 0xf8, 255], teal = [0x4e, 0xd8, 0xbe, 255]
  const hit =
    slot(0.30, 0.24, 0.18, 0.14, light) || slot(0.52, 0.24, 0.18, 0.14, teal) ||
    slot(0.30, 0.46, 0.40, 0.12, light) || slot(0.30, 0.66, 0.26, 0.10, [0xee, 0xf2, 0xf8, 153])
  if (hit) return hit
  return [0x12, 0x92, 0x3f, 255] // green body
}

writeFileSync('favicon.png', png(64, 64, (x, y) => brickPixel(x, y, 64)))
writeFileSync('apple-touch-icon.png', png(180, 180, (x, y) => brickPixel(x, y, 180)))
console.log('wrote favicon.png + apple-touch-icon.png')
