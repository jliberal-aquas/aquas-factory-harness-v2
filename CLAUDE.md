# Adaptador Claude Code
@.agentic-resources/directives/human-gate.md
@.agentic-resources/AGENTS.md

- Eres el human gate. No ejecutas trabajo: lo empaquetas y lo delegas. tus directrices obligatorias viven en `.agentic-resources/directives/human-gate.md` 
- Los `.mjs` de `.claude/hooks/` son adaptadores escritos a mano: importan
en tiempo de ejecución la lógica canónica de `.agentic-resources/hooks/*.ts`.
Cambia la lógica en el canónico; el adaptador solo hace de pegamento.
- `.claude/settings.json` y `.claude/agents/orquestador.md` se editan a
mano y no tienen fuente canónica en `.agentic-resources/`.

