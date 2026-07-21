/**
 * The music domain, in ONE place: the row shapes the app reads/writes (kept in
 * lockstep with schema.sql), the streaming-service catalog that gives each
 * platform button its brand chip, and the deterministic cover palette used when
 * a release has no artwork. Pure data + helpers — no React, no Base.
 */

/** A `release` row (Base stamps id/created/updated/owner/org). */
export interface Release {
  title: string
  artist: string
  cover_url?: string
  release_date?: string
}

/** A `links` row — one streaming button on the smart link. */
export interface PlatformLink {
  platform: string
  url: string
  clicks?: number
}

/** A service's brand chip: its color and a compact mark. */
export interface Brand {
  color: string
  mark: string
}

/**
 * Known services, matched case-insensitively by name. A link to any other
 * platform still renders — it just gets the neutral chip below — so an artist
 * can paste a link to anything.
 */
const CATALOG: Record<string, Brand> = {
  spotify: { color: '#1db954', mark: 'S' },
  'apple music': { color: '#fa243c', mark: '♪' },
  'youtube music': { color: '#ff0000', mark: '▸' },
  youtube: { color: '#ff0000', mark: '▸' },
  'amazon music': { color: '#25d1da', mark: 'a' },
  soundcloud: { color: '#ff5500', mark: '☁' },
  tidal: { color: '#00c9c9', mark: 'T' },
  bandcamp: { color: '#629aa9', mark: 'B' },
  deezer: { color: '#a238ff', mark: 'D' },
  pandora: { color: '#3668ff', mark: 'P' },
  'apple podcasts': { color: '#9933cc', mark: '♫' },
  beatport: { color: '#a8e00f', mark: 'b' },
}

const NEUTRAL: Brand = { color: '#8a8a94', mark: '♫' }

/** Brand chip for a platform name (neutral fallback for unknown services). */
export function brandFor(platform: string): Brand {
  return CATALOG[platform.trim().toLowerCase()] ?? NEUTRAL
}

/** Black or white — whichever reads on a chip of this color (WCAG luminance). */
export function inkOn(hex: string): string {
  const h = hex.replace('#', '')
  const n = h.length === 3 ? h.split('').map((c) => c + c).join('') : h
  const r = parseInt(n.slice(0, 2), 16) / 255
  const g = parseInt(n.slice(2, 4), 16) / 255
  const b = parseInt(n.slice(4, 6), 16) / 255
  const lin = (c: number) => (c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4)
  const l = 0.2126 * lin(r) + 0.7152 * lin(g) + 0.0722 * lin(b)
  return l > 0.42 ? '#0a0a0f' : '#ffffff'
}

/**
 * Cover palettes — a release with no artwork gets a stable, distinct gradient
 * chosen from its title, so the page always looks designed (never a blank box)
 * and the same release always renders the same way.
 */
const PALETTES: [string, string, string][] = [
  ['#12002e', '#7b2ff7', '#f107a3'],
  ['#0b486b', '#f56217', '#ffd194'],
  ['#1a2a6c', '#b21f1f', '#fdbb2d'],
  ['#000428', '#004e92', '#43cea2'],
  ['#3a1c71', '#d76d77', '#ffaf7b'],
  ['#0f2027', '#2c5364', '#00c9a7'],
  ['#42275a', '#bc4e9c', '#f7b2b7'],
  ['#232526', '#5b247a', '#1bcedf'],
]

export function paletteFor(seed: string): [string, string, string] {
  let h = 0
  for (let i = 0; i < seed.length; i++) h = (h * 31 + seed.charCodeAt(i)) >>> 0
  return PALETTES[h % PALETTES.length]
}
