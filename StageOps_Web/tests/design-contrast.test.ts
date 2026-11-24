import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { it } from 'node:test'

const css = readFileSync(new URL('../src/index.css', import.meta.url), 'utf8')

function color(name: string): string {
  const match = css.match(new RegExp(`--${name}:\\s*(#[0-9a-f]{6})\\s*;`, 'i'))
  assert.ok(match, `Missing CSS color token: ${name}`)
  return match[1]
}

function luminance(hex: string): number {
  const channels = hex.slice(1).match(/../g)?.map((channel) => {
    const value = parseInt(channel, 16) / 255
    return value <= 0.04045 ? value / 12.92 : ((value + 0.055) / 1.055) ** 2.4
  })
  assert.ok(channels)
  return channels[0] * 0.2126 + channels[1] * 0.7152 + channels[2] * 0.0722
}

function contrast(foreground: string, background: string): number {
  const light = Math.max(luminance(foreground), luminance(background))
  const dark = Math.min(luminance(foreground), luminance(background))
  return (light + 0.05) / (dark + 0.05)
}

it('keeps normal text and action labels legible on the light surfaces', () => {
  const pairs = [
    ['text-primary', 'bg-base'],
    ['text-muted', 'bg-base'],
    ['text-subtle', 'bg-elevated'],
    ['brand-violet', 'brand-soft'],
    ['brand-violet-hover', 'bg-base'],
    ['status-danger', 'bg-base'],
    ['brand-button-text', 'brand-violet'],
  ]

  for (const [foreground, background] of pairs) {
    const ratio = contrast(color(foreground), color(background))
    assert.ok(ratio >= 4.5, `${foreground} on ${background}: ${ratio.toFixed(2)}:1`)
  }
})

it('keeps form control boundaries distinguishable from their surface', () => {
  const ratio = contrast(color('control-border'), color('bg-base'))
  assert.ok(ratio >= 3, `control border: ${ratio.toFixed(2)}:1`)
})
