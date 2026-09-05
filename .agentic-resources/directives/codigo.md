# Reglas de codigo

Rigen todo lo que vive bajo `.agentic-resources/`.

1. TypeScript, sin excepcion. Los unicos `.mjs` legitimos son los
   adaptadores de `.claude/hooks/`, que existen por una limitacion del
   arnes y solo llaman a la logica `.ts`.
2. YAGNI y SOLID.
3. Como mucho DOS lineas seguidas de comentario. Si hace falta explicar
   mas, el comentario apunta al archivo exacto de `documentacion/codex/`.
4. Funciones cortas, archivos cortos, un archivo por funcionalidad.

Numeros medibles: 200 lineas por archivo, 2 lineas por bloque de
comentario seguido. Viven en `.agentic-resources/hooks/estilo.ts`
(`LIMITE_LINEAS`, `LIMITE_BLOQUE_COMENTARIO`); ahi se cambian, en ningun
otro sitio.
