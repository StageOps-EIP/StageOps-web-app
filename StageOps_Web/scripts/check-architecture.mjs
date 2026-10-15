import { readdirSync, readFileSync, existsSync, statSync } from 'node:fs'
import { dirname, resolve, relative, sep } from 'node:path'
import { fileURLToPath } from 'node:url'
import ts from 'typescript'

const root = resolve(dirname(fileURLToPath(import.meta.url)), '../src')
const normalize = (value) => value.split(sep).join('/')

export function checkBoundary(file, target) {
  if (file.startsWith('application/') && !/^(domain|application)\//.test(target)) {
    return 'L’application dépend uniquement de ses cas d’usage et des ports du domaine'
  }
  if (file.startsWith('domain/') && !target.startsWith('domain/')) {
    return 'Le domaine ne dépend que du domaine'
  }
  if (
    file.startsWith('infrastructure/') &&
    /^(app|application|pages|components|contexts|hooks)\//.test(target)
  ) {
    return 'L’infrastructure ne dépend pas de la présentation'
  }
  if (/^(pages|components|contexts|hooks)\//.test(file) && target.startsWith('infrastructure/')) {
    return 'Seule la composition app sélectionne les adaptateurs'
  }
  return null
}
function filesIn(directory) {
  return readdirSync(directory).flatMap((name) => {
    const path = resolve(directory, name)
    return statSync(path).isDirectory() ? filesIn(path) : /\.tsx?$/.test(name) ? [path] : []
  })
}
function importsIn(source) {
  const imports = []
  function visit(node) {
    if (
      (ts.isImportDeclaration(node) || ts.isExportDeclaration(node)) &&
      node.moduleSpecifier &&
      ts.isStringLiteral(node.moduleSpecifier)
    )
      imports.push(node.moduleSpecifier.text)
    if (
      ts.isCallExpression(node) &&
      node.expression.kind === ts.SyntaxKind.ImportKeyword &&
      node.arguments[0] &&
      ts.isStringLiteral(node.arguments[0])
    )
      imports.push(node.arguments[0].text)
    ts.forEachChild(node, visit)
  }
  visit(source)
  return imports
}
export function findCycles(graph) {
  const visiting = new Set()
  const visited = new Set()
  const cycles = []
  function walk(file, path) {
    if (visiting.has(file)) {
      cycles.push([...path, file].join(' -> '))
      return
    }
    if (visited.has(file)) return
    visiting.add(file)
    for (const target of graph.get(file) ?? []) walk(target, [...path, file])
    visiting.delete(file)
    visited.add(file)
  }
  for (const file of graph.keys()) walk(file, [])
  return cycles
}
export function checkArchitecture(sourceRoot = root) {
  const errors = []
  const graph = new Map()
  for (const path of filesIn(sourceRoot)) {
    const file = normalize(relative(sourceRoot, path))
    const text = readFileSync(path, 'utf8')
    const source = ts.createSourceFile(path, text, ts.ScriptTarget.Latest, true)
    const dependencies = []
    if (/^(domain|application)\//.test(file)) {
      const forbidden = new Set(['window', 'document', 'localStorage', 'sessionStorage', 'fetch'])
      function visit(node) {
        if (ts.isIdentifier(node) && forbidden.has(node.text))
          errors.push(file + ': navigateur interdit (' + node.text + ')')
        ts.forEachChild(node, visit)
      }
      visit(source)
    }
    for (const specifier of importsIn(source)) {
      let target = specifier
      if (specifier.startsWith('.') || specifier.startsWith('@/')) {
        const base = specifier.startsWith('@/')
          ? resolve(sourceRoot, specifier.slice(2))
          : resolve(dirname(path), specifier)
        const resolved = [
          base,
          base + '.ts',
          base + '.tsx',
          resolve(base, 'index.ts'),
          resolve(base, 'index.tsx'),
        ].find((candidate) => existsSync(candidate) && statSync(candidate).isFile())
        if (!resolved) {
          if (!/\.(css|svg|png|jpg)$/.test(specifier))
            errors.push(file + ': import introuvable ' + specifier)
          continue
        }
        target = normalize(relative(sourceRoot, resolved))
        dependencies.push(target)
      }
      const violation = checkBoundary(file, target)
      if (violation) errors.push(file + ' -> ' + target + ': ' + violation)
    }
    graph.set(file, dependencies)
  }
  errors.push(...findCycles(graph).map((cycle) => 'Cycle: ' + cycle))
  return errors
}
if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const errors = checkArchitecture()
  if (errors.length) {
    console.error(errors.join('\n'))
    process.exitCode = 1
  } else console.log('Architecture: frontières et cycles vérifiés.')
}
