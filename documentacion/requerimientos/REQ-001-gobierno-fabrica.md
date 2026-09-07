# REQ-001 Gobierno de la fabrica

Estado: abierto

## Decisiones

D1. Los productos viven fuera del repo del motor, como directorios hermanos. El motor guarda un registro nombre a ruta. El motor es su propio producto y su raiz es este repo.
D2. El alta de producto se hace por CLI no interactivo: aquas producto nuevo, listar, baja. La TUI viene despues como cascara sobre esos comandos. Motivo: un agente no maneja una TUI.
D3. La concurrencia a proteger es una maquina con varias sesiones. SSH desde varios clientes colapsa el caso multi-maquina en ese mismo caso. El lock y el registro de productos viven en SQLite del motor y no se trackean en git.
D4. El lock se toma a nombre del dueno, no de la sesion. El latido se estampa en el hook Stop que ya existe. Mismo dueno toma directo. Otro dueno con latido fresco: denegado. Otro dueno sin latido: toma forzada con motivo auditado. No hay TTL ciego.
D5. Si se toma el lock sin checkout previo, el motor crea un commit WIP automatico antes de entregar el control.
D6. Backlog y memoria caliente son archivos trackeados en git dentro del repo de cada producto.
D7. Jerarquia de trabajo: BKL item de backlog de grano grueso que nace sin spec; REQ requerimiento igual a una peticion humana; ESP especificacion; TCK ticket; Tarea contrato efimero de worker. Un ticket es un commit. Una Tarea no commitea.
D8. El item de backlog se cierra cuando cierra la spec, no cuando se commitea cada ticket. Al commitear un ticket se cierra el ticket.
D9. La spec es la feature. No existe identificador FEA. Identificadores: BKL-NNN, REQ-NNN, ESP-NNN con version, TCK-NNN-MM.
D10. El REQ existe siempre, uno por peticion humana, aunque produzca una sola spec. Es un documento corto: intencion en palabras del humano, restricciones, criterio de aceptacion global e indice de specs hijas. Los bugs no crean REQ: cuelgan de la ESP que incumplen.
D11. grill-with-docs corre sobre el REQ y produce el documento REQ mas la descomposicion en specs candidatas. to-spec corre una vez por spec hija. to-tickets por spec. implement por ticket.
D12. La spec vigente es el arbitro de clasificacion. Si no existe spec del area es feature nueva. Si la spec dice lo que debe pasar y el codigo no lo cumple es bug y la spec no cambia. Si la spec calla o dice otra cosa es cambio de alcance y la spec sube de version.
D13. Un bug no pasa por grill ni por to-spec. Va directo a ticket. Exige spec_id, apartado incumplido y reproduccion. Cierra cuando pasa el test que lo reproduce.
D14. Un cambio de alcance pasa por un grill acotado al delta y produce una version nueva de la spec existente, no una spec nueva.
D15. Se crea una sola skill nueva, triage, que clasifica un hallazgo aplicando D12 y cita el texto de la spec que justifica la clasificacion.
D16. Ningun agente clasifica ni corrige en vuelo. Un hallazgo sale del turno como bloqueo o como pendiente y cae al backlog sin clasificar.
D17. La memoria caliente tiene presupuesto fijo de 60 lineas: REQ-NNN/decisiones.md con tope 20 lineas solo para decisiones transversales, y ESP-NNN/hot.md con tope 40 lineas activo mientras la spec vive. No hay memoria por ticket. Formato caveman.
D18. ESP-NNN/hot.md se archiva entero cuando cierra la spec.
D19. El contrato CierreTurno gana el campo memoria_caliente con dos listas: agregar y retirar. El orquestador decide ambas. El hook rechaza el cierre si el resultado no cabe en el tope.
D20. Los pendientes del CierreTurno van al backlog, nunca a memoria caliente.
D21. La memoria caliente admite decisiones que cambian el rumbo, invariantes descubiertos, bloqueos abiertos y rutas clave. No admite la lista completa de evidencias, ni el veredicto de verificacion, ni los pendientes.
D22. El contrato Turno gana el campo tipo con valores ejecucion y grill. Un Turno de tipo grill devuelve preguntas y no modifica archivos de producto.

## Hallazgos del arnes

H1. .agentic-resources/tools/backlog-anotar.mjs no existe. Las skills to-spec y to-tickets fallan al ejecutarlo.
H2. .agentic-resources/hooks/estilo.ts no existe. directives/codigo.md cita LIMITE_LINEAS y LIMITE_BLOQUE_COMENTARIO que no estan en ningun archivo.
H3. Las Entregas y el CierreTurno no se persisten en .aquas. Contradice GR4.
H4. verifier declara Bash en su frontmatter y ningun gate cruza ese permiso contra ejecucion.comandos de su Tarea.
H5. researcher dispone de WebFetch y WebSearch. GR3 deja de ser inaplicable por construccion. Verificado en .agentic-resources/adapters/claude-code/agents.ts:94-95 y .claude/agents/researcher.md:4.
H6. No existe gate que exija un effort minimo al agente que conduce analisis de requisitos. human-gate condujo las decisiones D1 a D22 con effort low. El humano corrigio manualmente a effort high el 2026-09-07. Estado actual verificado: effort high en .agentic-resources/adapters/claude-code/agents.ts:49 y .claude/agents/human-gate.md:6.
H7. .agentic-resources/adapters/claude-code/compile-agents.ts tiene 201 lineas y supera el limite de 200 de codigo.md.
H8. codigo.md regla 1 describe adaptadores .mjs que no existen. Los adaptadores reales son .ts.
H9. ManageHumanGateStop.ts es no-op. El cierre de human-gate no se verifica.
H10. No existe skill to-ticket en singular. El nombre real es to-tickets.
H11. El frontmatter de los agentes no vive en .agentic-resources/agents/*.md sino en .agentic-resources/adapters/claude-code/agents.ts. Los archivos .md de .agentic-resources/agents aportan solo el cuerpo. Cualquier cambio de model o effort se hace en agents.ts.
H12. El contrato de cierre no registra contra que estado del repositorio se realizo cada observacion. El repositorio muta durante la sesion. Dos auditorias reportaron effort distinto para human-gate y ambas eran ciertas en su momento. Sin commit ni marca de tiempo de observacion, dos observaciones validas se leen como contradiccion. Exigir referencia archivo:linea no habria evitado este caso.
H13. Las decisiones D1 a D22 se tomaron con human-gate en effort low. Requieren un pase de revision con effort high antes de construir sobre ellas.

## Pendientes

P1. Definir el esquema del item de backlog y si es un archivo por item o un archivo unico.
P2. Definir el mecanismo de deseables y como se autoriza al owner que promueve al backlog.
P3. Definir el orden de construccion de los mecanismos.
P4. Carril rapido para fixes triviales: descartado por ahora, se reevalua con datos.
P5. Ejecutar el pase de revision de D1 a D22 descrito en H13.

## Specs hijas
