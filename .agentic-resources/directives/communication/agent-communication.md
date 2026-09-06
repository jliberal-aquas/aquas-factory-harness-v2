# Comunicación entre agentes

> Rige el intercambio dinámico entre agentes. No rige la comunicación del agente principal con el humano.
>
> Políticas estáticas, system prompts, herramientas y entorno no cuentan como comunicación entre agentes.

## Contrato único

- El contrato es la única fuente dinámica de trabajo entre agentes.
- Entre agentes viaja únicamente el identificador o ruta del contrato. No se añade contexto conversacional, historial humano, resúmenes ni instrucciones de trabajo fuera de él.
- El contrato contiene o referencia todo input, alcance, criterio y evidencia necesarios.
- El agente puede descubrir detalles técnicos dentro del alcance autorizado. Si falta una decisión, autoridad, criterio o input necesario que no puede derivarse de la evidencia, cierra bloqueado según su contrato de cierre.

## Contrato inmutable

- Un contrato materializado nunca se modifica.
- Un cambio de alcance, input o criterio requiere nueva versión o nuevo contrato.
- No hay correcciones laterales, steering ni conversación libre entre agentes.
- Toda delegación adicional requiere un contrato hijo y aplica este mismo protocolo.

## Salida única

- El único payload textual de salida de un subagente hacia otro agente es su contrato de cierre.
- Durante la ejecución usa herramientas directamente. No emite narración, progreso, intención ni explicaciones sueltas.
- Todo estado de salida se expresa mediante el contrato de cierre y sus valores canónicos.

## Registro Caveman

- Los campos de texto libre del contrato son factuales, breves y atómicos.
- Sin cortesía, transiciones, anuncios de intención, pedagogía, analogías ni repetición.
- Incluye causa o justificación solo cuando sea necesaria para comprender un resultado o decisión.
- Código, comandos, IDs, rutas, errores y literales conservan su forma exacta.
- Logs, artefactos y evidencia extensa se referencian por ruta, ID o hash cuando no sea necesario copiarlos.
- Un hecho se transmite una vez.

## Registro operacional

- El contrato comunica resultados. El registro operacional conserva evidencia.
- El agente no narra su actividad para producir logs. La observabilidad corresponde al arnés.

## Invariante

**Entre agentes no existe comunicación de trabajo fuera del contrato.**
Si información necesaria no puede representarse o referenciarse mediante el contrato, el protocolo o su esquema están incompletos.