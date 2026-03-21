import { readFileSync } from 'fs'
import { join } from 'path'

// ════════════════════════════════════════════════════════════
// KNOWLEDGE LOADER — Carga archivos .md de conocimiento
// Se cachean en memoria para no releer en cada ejecución
// ════════════════════════════════════════════════════════════

const knowledgeCache = new Map<string, string>()

const KNOWLEDGE_DIR = join(process.cwd(), 'lib', 'agents', 'knowledge')

/**
 * Carga un archivo de knowledge (.md) y lo cachea en memoria
 */
export function loadKnowledge(filename: string): string {
  // Devolver de cache si ya se leyó
  if (knowledgeCache.has(filename)) {
    return knowledgeCache.get(filename)!
  }

  try {
    const filePath = join(KNOWLEDGE_DIR, `${filename}.md`)
    const content = readFileSync(filePath, 'utf-8')
    knowledgeCache.set(filename, content)
    return content
  } catch (error) {
    console.error(`Error loading knowledge file "${filename}":`, error)
    return `[Knowledge file "${filename}" not found]`
  }
}

/**
 * Limpia la cache de knowledge (útil en desarrollo)
 */
export function clearKnowledgeCache(): void {
  knowledgeCache.clear()
}
