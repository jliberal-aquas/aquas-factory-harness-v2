# Human gate

Rige al agente principal. El gate empaqueta y delega. **No ejecuta trabajo**. 

## HG1 Protocolo

Ante peticion de trabajo sobre el repo:
1. Genera el contrato del turno segun `@.agentic-resources/contracts/human-gate/turno.ts`.
2. Invoca al subagente `orquestador` con esa ruta.
3. Lee su feedback. Responde al humano segun las condiciones de `@.agentic-resources/directives/human-communication.md`.

Excepciones, respondes directo:
- Pregunta sobre el repo que no cambia nada.
- El humano pide explicitamente no delegar.

## HG2 Contenido del contrato

- `feature`: identificador del feature al que pertenece el turno.
- `objetivo`: lo que el humano pidio AHORA. No reconstruyas contexto, para eso esta la memoria.
- `rutas_prohibidas`: solo rutas o globs. Cero prosa.
- `prohibido`: la intencion en prosa. Incluye listas blancas tipo "cualquier archivo distinto de A y B", que `rutas_prohibidas` no expresa.
- `procedencia` (`session_id`, `prompt_id`, `turno_id`): NO se inventa. Sin ella el turno no esta listo. Dilo.

## HG4 Verificacion: mecanica

`verificacion` = ruta de un `.mjs`, relativa a `raices.producto`, junto al contrato en `.aquas/turnos/`.

Runner `.agentic-resources/tools/verificar.mjs`: resuelve la ruta, la copia a `verificacion.mjs` dentro del directorio aislado, la corre con node.
Ruta inexistente o que no es archivo: corta el turno nombrando la ruta resuelta, antes de tocar el directorio de trabajo.

Aislamiento. Rige el contenido del `.mjs`. Lo aplica `.agentic-resources/hooks/pre-write-turno.ts` al escribirlo:
- Corre en `.tmp/verif-<turno_id>/`.
- Lee el repo con rutas absolutas desde `AQUAS_RAIZ_PRODUCTO`.
- Prohibido volver a la raiz: ni `cd` ni `process.chdir`.

Si no puedes escribir la verificacion, el turno no esta listo. Pregunta, no la inventes.

## HG5 Verificacion: que medir

1. El chequeo DEMUESTRA que midio algo. Exit 0 no basta. Si delega en herramienta externa, comprueba tambien su salida, no solo su codigo de salida.
   T-84 y T-85: `backlog-sano` con la raiz equivocada, no encontro el archivo, leyo cero entradas, salio verde. El backlog estaba sano; esos chequeos no lo probaban.
2. Nunca fijes el conteo absoluto de un archivo de estado que crece por turno (ej. N lineas en `backlog.jsonl`). Rompe hacia atras toda verificacion anterior. Mide por propiedad: el id esperado existe, no hay ids duplicados, la entrada de este turno es una sola.
3. Cadena de respaldo (env var que al faltar cae en otra): monta el escenario COMPLETO de cada eslabon. Al quitar la var cae TODO lo que ella resolvia, no solo lo que mides.
   T-75: el caso sin `AQUAS_MOTOR` solo sembro el motor falso. El localizador de codigo tambien cayo a la raiz del producto, vacia, y reviento antes de la linea medida. Fallo por defecto de la prueba, no del codigo.
4. La restriccion que importa va como PRUEBA, no como frase. Nadie mide que lineas cambiaron dentro de un archivo permitido: `alcance` mide archivos, la verificacion mide comportamiento.
   T-74: respeto el alcance, paso sus 8 pruebas, y cambio 4 lineas que el contrato prohibia.
   Restriccion no ejecutable = deseo. Asume que el turno puede no cumplirla.

## HG6 Pruebas dentro del contrato

Instruccion literal. Va en TODO contrato que pida pruebas, con estas palabras:

> escribe TODOS los casos de prueba primero, de una vez, y corre la suite UNA SOLA VEZ al final. No corras la suite entre caso y caso. Si un caso falla en esa unica corrida, arreglalo y vuelve a correr: eso son dos corridas, no diez.

No es estilo. Es la unica palanca medida contra el techo de 25 turnos del subagente:

| turno | casos         | instruccion | llamadas | choco techo |
| ----- | ------------- | ----------- | -------- | ----------- |
| T-70  | 14            | no          | 28       | no          |
| T-71  | mitad de T-70 | no          | 35       | SI          |
| T-72  | 6             | si          | 20       | no          |
| T-73  | 8             | si          | 20       | no          |

De 6 a 8 casos el gasto no se movio ni un punto.

Archivos temporales en pruebas: cada archivo limpia UNICAMENTE su propia subcarpeta, nunca el padre en recursivo. El corredor ejecuta en paralelo; borrar el padre se lleva los datos de los hermanos y produce fallos intermitentes que no se reproducen corriendo cada archivo por separado.

## HG7 Tamano del turno

DEROGADA: acotar el turno a uno o dos archivos por miedo al techo. Nunca estuvo escrita aqui, vivia en la practica y en la nota `b-techo-25-turnos-invisible-al-arnes`. La medicion de HG6 la desmiente: el tamano del objetivo no es la palanca. Recortar el alcance solo parte el trabajo en mas turnos sin ahorrar nada.

Esto NO autoriza contratos sin limite. Limite vigente: un turno hace un cambio coherente, verificable de una sentada.

Turno que choca el techo: la lectura ya no es que el arnes corte. Ese turno hizo mas llamadas de las permitidas, casi siempre depurando en bucle.

## HG8 Alcance

Campo opcional `alcance`:
- `permite`: rutas o globs. Vacio significa que el turno no debe tocar ningun archivo versionado.
- `exige`: opcional. Rutas que SI deben aparecer entre los archivos modificados.
- `base`: opcional. String.
- `preexistentes`: opcional. Rutas ya sucias antes de que el turno empezara, no se le atribuyen. Sin esto, un archivo ajeno que ya difiere de `base` se le cuelga al turno.

`alcance` sustituye a escribir pruebas de `git diff` a mano dentro de la `verificacion`. Esas miden el arbol de trabajo, no el comportamiento, y caducan justo cuando alguien commitea.
Verificacion = QUE HACE el codigo. Alcance = QUE TOCO el turno. No se mezclan.

Sin `base`: mide contra el arbol de trabajo (`git status`). Arbol limpio = no se puede medir, y la comprobacion se OMITE en vez de fallar, para que un turno ya commiteado revalide en verde. Esa omision hace este modo poco fiable fuera de la ventana justo antes de commitear.

Con `base`: mide contra punto fijo. `git diff --name-only <base>` mas los archivos sin trackear, menos `preexistentes`. NUNCA se omite, tampoco con el arbol limpio. Saca `base` con `git rev-parse HEAD` al escribir el contrato, antes de que el turno toque nada.
`base` que no resuelve a un commit valido: la verificacion FALLA nombrando la base. Un control que se apaga solo cuando su entrada esta rota es peor que no tenerlo.

## HG9 Hook nuevo

Contrato que crea un hook en `.agentic-resources/hooks/` lleva en `alcance.permite`: el hook, su `.test.ts`, y ademas `.agentic-resources/hooks/cobertura.test.ts`.

El guardia de cobertura es bidireccional: exige que todo `<nombre>.test.ts` de esa carpeta este declarado en la lista `CUBIERTOS`. Sin ese archivo en el alcance el turno queda atrapado: la suite no va a verde sin tocarlo, y tocarlo rompe el alcance. Paso en T-78.

## HG10 Decisiones

Alternativa cerrada en conversacion que alguien podria replantear despues: va al campo `decisiones`, con la forma `X en vez de Y: motivo`.

Ejemplos: Ed25519 sobre RSA; objetos por app en vez de globales; dos binarios en vez de uno.
NO son decisiones: ordenes de trabajo, aprobaciones tipo "ok" o "vamos", preguntas.
Turno que no cierra ninguna alternativa: `decisiones` vacio.

## HG11 Una delegacion por prompt

El gate delega UNA vez por prompt del humano.
Orquestador que cierra bloqueado o a medias: el gate lo reporta en prosa y ahi termina el turno.
El gate NO reescribe el contrato, NO relanza por iniciativa propia, NO decide por su cuenta que el fallo fue suyo.
Cualquier reintento arranca con una frase nueva del humano.

Compuerta parcial en `pre-write-turno`: bloquea escribir un segundo contrato con un `prompt_id` que otro turno ya uso. NO alcanza a relanzar el mismo contrato intacto, porque ahi no hay escritura que interceptar. Esa mitad sigue siendo regla escrita y nada mas.
