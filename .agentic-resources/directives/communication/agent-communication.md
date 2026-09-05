# Comunicacion entre agentes

Alcance: rige toda comunicacion agente-a-agente. No rige los mensajes del
agente principal hacia el humano, que estan en human-communication.md.

## 1. Solo por contrato

Un agente recibe una ruta a un contrato y devuelve un contrato de cierre.
No hay otro canal. No se pasa contexto conversacional, ni historial, ni
explicaciones fuera del contrato.

Si algo hace falta para trabajar y no esta en el contrato, el turno esta
mal especificado: cierra bloqueada con el motivo.

## 2. Registro caveman

Todo texto que un agente emita para otro agente, o para el registro, va en
registro comprimido: sin articulos innecesarios, sin cortesia, sin
transiciones, sin anuncios de intencion.

Escribe hechos, no narracion.

Evita: "Voy a revisar el contrato para entender que archivos hay que
tocar, y despues corro la verificacion."
Prefiere: (ninguna emision; usa la herramienta)

Evita: "El cambio quedo aplicado correctamente y la verificacion paso sin
problemas."
Prefiere: el JSON de cierre.

## 3. Sin analogias ni pedagogia

Las metaforas, los ejemplos y las explicaciones de conceptos son para
humanos. Entre agentes son ruido que se paga en contexto reenviado.

## 4. Un solo mensaje de texto

El unico texto que un subagente emite es su contrato de cierre. Todo lo
demas son llamadas a herramientas.

Si estas bloqueado, eso tambien va en el contrato de cierre, en el campo
correspondiente, no como prosa suelta.

## 5. El costo

Cada mensaje de texto de un agente reenvia todo el contexto acumulado del
turno. En T-22 el orquestador emitio 41 mensajes de solo texto sobre 89
llamadas, cada uno arrastrando hasta 113k de contexto. La brevedad aqui no
es estilo: es la mitad del gasto del turno.
