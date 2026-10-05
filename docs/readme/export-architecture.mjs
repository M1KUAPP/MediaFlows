#!/usr/bin/env node
/**
 * Exports the README architecture diagram in the MediaFlows colour tokens.
 *
 * Archify (https://github.com/tt-a1i/archify) renders architecture.json into a
 * standalone HTML viewer. This script copies architecture.json to a temporary
 * directory with the `meta.output` field that `archify deliver` requires, runs
 * `deliver`, restyles the viewer with the apps/web/src/app/globals.css tokens,
 * and saves the viewer's own SVG export once per colour scheme.
 *
 * Archify's export resolves every theme variable with getComputedStyle and
 * copies page rules whose selector starts with `svg` or `[data-theme`, so the
 * token overrides below reach the SVG. Its "Download SVG" output carries both
 * themes and follows prefers-color-scheme; GitHub's <picture> needs one file
 * per theme, so each export gets data-theme on its root <svg>, which archify
 * documents as the way to force a theme.
 *
 * Inputs:
 *   - docs/readme/architecture.json, the archify source (committed without meta.output)
 *   - the archify CLI, bin/archify.mjs from an archify checkout or skill install (v2.17)
 *
 * Re-run, from the repository root:
 *   (cd apps/web && pnpm install)   # once, for Playwright
 *   node docs/readme/export-architecture.mjs <archify>/bin/archify.mjs
 *
 * Uses the installed Google Chrome, or Playwright's Chromium when Chrome is
 * missing (`pnpm --dir apps/web exec playwright install chromium`, once).
 *
 * Writes: architecture-light.svg and architecture-dark.svg beside this file.
 */

import { execFileSync } from 'node:child_process'
import { createRequire } from 'node:module'
import fs from 'node:fs'
import os from 'node:os'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const README_DIR = path.dirname(fileURLToPath(import.meta.url))
const WEB_DIR = path.resolve(README_DIR, '../../apps/web')
const require = createRequire(path.join(WEB_DIR, 'package.json'))
const { chromium } = require('@playwright/test')

// apps/web/src/app/globals.css tokens (oklch converted to hex) mapped onto Archify's theme variables.
const THEMES = {
  light: {
    '--bg': '#FFFFFF', // --background
    '--mask': '#FFFFFF', // --background
    '--grid': '#F5F5F5', // --secondary
    '--panel': '#FFFFFF', // --card
    '--panel-border': '#E5E5E5', // --border
    '--text': '#0A0A0A', // --foreground
    '--text-muted': '#737373', // --muted-foreground
    '--text-dim': '#A1A1A1', // --ring
    '--text-faint': '#737373', // --muted-foreground
    '--arrow': '#A1A1A1', // --ring
    '--arrow-emphasis': '#171717', // --primary
    '--frontend-fill': 'rgba(22, 93, 252, 0.08)', // --status-published
    '--frontend-stroke': '#165DFC', // --status-published
    '--backend-fill': 'rgba(47, 196, 97, 0.1)', // --status-approved
    '--backend-stroke': '#2FC461', // --status-approved
    '--database-fill': '#F5F5F5', // --secondary
    '--database-stroke': '#171717', // --primary
    '--cloud-fill': 'rgba(223, 172, 0, 0.1)', // --status-pending
    '--cloud-stroke': '#DFAC00', // --status-pending
    '--security-fill': 'rgba(231, 0, 11, 0.06)', // --destructive
    '--security-stroke': '#E7000B', // --destructive
    '--messagebus-fill': 'rgba(255, 106, 0, 0.08)', // --status-changes
    '--messagebus-stroke': '#FF6A00', // --status-changes
    '--external-fill': '#FAFAFA', // --sidebar
    '--external-stroke': '#737373' // --muted-foreground
  },
  dark: {
    '--bg': '#0A0A0A', // .dark --background
    '--mask': '#0A0A0A', // .dark --background
    '--grid': '#171717', // .dark --card
    '--panel': '#171717', // .dark --card
    '--panel-border': '#262626', // .dark --muted
    '--text': '#FAFAFA', // .dark --foreground
    '--text-muted': '#A1A1A1', // .dark --muted-foreground
    '--text-dim': '#737373', // .dark --ring
    '--text-faint': '#A1A1A1', // .dark --muted-foreground
    '--arrow': '#737373', // .dark --ring
    '--arrow-emphasis': '#E5E5E5', // .dark --primary
    '--frontend-fill': 'rgba(22, 93, 252, 0.16)', // --status-published
    '--frontend-stroke': '#165DFC', // --status-published
    '--backend-fill': 'rgba(47, 196, 97, 0.14)', // --status-approved
    '--backend-stroke': '#2FC461', // --status-approved
    '--database-fill': '#262626', // .dark --muted
    '--database-stroke': '#E5E5E5', // .dark --primary
    '--cloud-fill': 'rgba(223, 172, 0, 0.14)', // --status-pending
    '--cloud-stroke': '#DFAC00', // --status-pending
    '--security-fill': 'rgba(255, 100, 103, 0.12)', // .dark --destructive
    '--security-stroke': '#FF6467', // .dark --destructive
    '--messagebus-fill': 'rgba(255, 106, 0, 0.14)', // --status-changes
    '--messagebus-stroke': '#FF6A00', // --status-changes
    '--external-fill': '#171717', // .dark --card
    '--external-stroke': '#A1A1A1' // .dark --muted-foreground
  }
}

const declarations = (vars) =>
  Object.entries(vars)
    .map(([name, value]) => `${name}: ${value};`)
    .join(' ')

const tokenCss = [
  `[data-theme="dark"] { ${declarations(THEMES.dark)} }`,
  `[data-theme="light"] { ${declarations(THEMES.light)} }`
].join('\n')

function restyle(html) {
  if (!html.includes('id="archify-fonts"'))
    throw new Error('No #archify-fonts style element: is this an Archify HTML file?')
  return html.replace('</head>', `<style id="mediaflows-tokens">\n${tokenCss}\n</style>\n</head>`)
}

async function launch() {
  try {
    return await chromium.launch({ channel: 'chrome' })
  } catch {
    return await chromium.launch()
  }
}

async function exportSvg(browser, pageUrl, colorScheme, outFile) {
  const context = await browser.newContext({
    colorScheme,
    acceptDownloads: true,
    viewport: { width: 1440, height: 900 }
  })
  const page = await context.newPage()
  await page.goto(pageUrl)
  await page.evaluate(() => document.fonts.ready)
  const theme = await page.evaluate(() => document.documentElement.getAttribute('data-theme'))
  if (theme !== colorScheme) throw new Error(`Viewer opened in ${theme} theme, expected ${colorScheme}`)

  await page.click('#btn-export')
  const [download] = await Promise.all([page.waitForEvent('download'), page.click('#export-menu [data-format="svg"]')])
  const svg = fs.readFileSync(await download.path(), 'utf8')
  const locked = svg.replace(/<svg\b/, `<svg data-theme="${colorScheme}"`)
  if (locked === svg) throw new Error('No <svg> root element in the export')
  fs.writeFileSync(outFile, locked)
  await context.close()
}

const archify = process.argv[2]
if (!archify || !fs.existsSync(archify)) {
  console.error('Usage: node docs/readme/export-architecture.mjs <archify>/bin/archify.mjs')
  process.exit(2)
}

const workDir = fs.mkdtempSync(path.join(os.tmpdir(), 'mediaflows-architecture-'))
try {
  const source = JSON.parse(fs.readFileSync(path.join(README_DIR, 'architecture.json'), 'utf8'))
  source.meta.output = 'architecture.html'
  const input = path.join(workDir, 'architecture.json')
  const delivered = path.join(workDir, 'architecture.html')
  fs.writeFileSync(input, JSON.stringify(source, null, 2))
  execFileSync(
    process.execPath,
    [archify, 'deliver', 'architecture', input, delivered, '--quality', source.meta.quality_profile ?? 'standard'],
    { stdio: 'inherit' }
  )

  const styled = path.join(workDir, 'architecture-styled.html')
  fs.writeFileSync(styled, restyle(fs.readFileSync(delivered, 'utf8')))

  const browser = await launch()
  try {
    for (const scheme of ['light', 'dark']) {
      const outFile = path.join(README_DIR, `architecture-${scheme}.svg`)
      await exportSvg(browser, `file://${styled}`, scheme, outFile)
      console.log(`wrote ${path.relative(process.cwd(), outFile)}`)
    }
  } finally {
    await browser.close()
  }
} finally {
  fs.rmSync(workDir, { recursive: true, force: true })
}
