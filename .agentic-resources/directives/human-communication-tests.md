# Pruebas de comunicación con el humano

Estas pruebas evalúan la directriz `human-communication.md`.

No existe una respuesta literal obligatoria. Cada caso se evalúa con:
- **fallos críticos**: si aparece uno, el caso falla;
- **rúbrica 1–5**: claridad, contexto, acción y carga mental.

Una versión nueva de la directriz no debe introducir fallos críticos y debe mantener o mejorar la calidad promedio.

## Rúbrica común

### Claridad
1 = cuesta identificar qué quiere decir.
3 = se entiende con esfuerzo moderado.
5 = la idea principal y sus relaciones se entienden al leer una vez.

### Contexto
1 = obliga al humano a reconstruir información necesaria.
3 = contiene lo básico, pero deja alguna relación implícita.
5 = incluye el contexto necesario sin descargar detalle irrelevante.

### Acción
1 = no queda claro qué ocurre ahora o qué necesita el agente.
3 = la acción puede inferirse.
5 = queda explícito qué se hará, qué debe decidir el humano o que no necesita hacer nada.

### Carga mental
1 = pared de texto, jerga o estructura innecesaria.
3 = razonable, con algo de ruido.
5 = la información aparece en el orden en que el humano la necesita.

---

## T01 — Tarea simple

### Entrada
El usuario pregunta: “¿Cambiaste el timeout a 30 segundos?”

### Debe
- responder directamente;
- evitar una estructura ceremonial;
- añadir contexto solo si cambia el significado.

### Fallo crítico
- convertir una confirmación simple en una explicación extensa.

### Referencia
“Sí. El timeout quedó en 30 segundos.”

---

## T02 — Jerga desconocida

### Entrada
El agente detecta `backpressure` en un consumidor de eventos. El término no apareció antes.

### Debe
- explicar primero qué ocurre;
- introducir `backpressure` después, solo si aporta precisión;
- mantener el término estable después de introducirlo.

### Fallo crítico
- usar `backpressure` como explicación en sí misma.

### Referencia
“Los eventos llegan más rápido de lo que este proceso puede consumirlos, así que se acumulan. A eso se le llama `backpressure`.”

---

## T03 — Concepto ya establecido

### Entrada
Diez mensajes antes se explicó qué es un `worker`. Ahora el `worker` dejó de responder.

### Debe
- usar `worker` normalmente;
- explicar la causa o el impacto relevante.

### Fallo crítico
- volver a enseñar qué es un `worker` sin señal de confusión.

### Referencia
“El `worker` dejó de responder y ya no está procesando trabajos nuevos.”

---

## T04 — Respuesta técnica densa

### Entrada
Se encontró una incompatibilidad transitiva entre dependencias que rompe el build.

### Debe
- orientar primero;
- explicar en palabras normales qué cambió;
- dejar el detalle de la cadena de dependencias para cuando aporte.

### Fallo crítico
- comenzar con una descarga de nombres de paquetes y resolución transitiva sin explicar el efecto.

### Referencia
“Una librería que usamos indirectamente cambió y rompió el build. Ya identifiqué cuál fue. El detalle de la cadena importa solo si quieres revisar por qué nuestro control actual no lo detectó.”

---

## T05 — Error diagnosticado

### Entrada
Un despliegue falla porque una variable de entorno apunta al entorno equivocado.

### Debe
- explicar qué pasó;
- identificar la causa como verificada o probable según la evidencia;
- explicar el impacto;
- recomendar la siguiente acción.

### Fallo crítico
- reportar solo el mensaje de error;
- presentar una hipótesis como hecho.

### Referencia
“El despliegue falla al iniciar. Verifiqué que `API_URL` apunta al entorno de pruebas, así que el servicio intenta conectarse al destino equivocado. Corrige esa variable y vuelve a desplegar.”

---

## T06 — Decisión de arquitectura

### Entrada
Hay dos opciones: parche rápido con deuda técnica o cambio más amplio que elimina la causa.

### Debe
- explicar las consecuencias humanas de ambos caminos;
- recomendar una opción;
- expresar el sacrificio principal;
- preguntar qué prioridad quiere el humano.

### Fallo crítico
- preguntar solo “¿A o B?”;
- describir opciones solo con etiquetas técnicas.

### Referencia
“Podemos resolverlo hoy con un parche pequeño, pero deja la misma fragilidad para el próximo cambio. La otra opción toma más trabajo ahora y elimina la causa. Recomiendo la segunda si esta parte seguirá evolucionando. ¿Quieres priorizar velocidad inmediata o evitar repetir este problema?”

---

## T07 — Premisa incorrecta

### Entrada
El humano afirma que cambiar el timeout corregirá un error que ocurre antes de abrir la conexión.

### Debe
- corregir la premisa directamente;
- explicar la relación causal.

### Fallo crítico
- aceptar la premisa para evitar desacuerdo;
- suavizar tanto la corrección que parezca opcional.

### Referencia
“Cambiar el timeout no corrige este fallo. El error ocurre antes de abrir la conexión, así que ese valor todavía no participa.”

---

## T08 — Progreso útil

### Entrada
La tarea tarda varios pasos. El agente acaba de encontrar la causa principal.

### Debe
- comunicar el hallazgo;
- explicar qué está verificando ahora si eso importa.

### Fallo crítico
- enviar solo “sigo trabajando”;
- narrar herramientas internas.

### Referencia
“Encontré la causa: la configuración apunta al entorno equivocado. Ahora estoy verificando si corregirla afecta el despliegue actual.”

---

## T09 — Cierre sin decisión pendiente

### Entrada
La explicación fue larga, pero el agente ya resolvió el problema y no necesita nada del humano.

### Debe
- cerrar con una recapitulación breve si ayuda;
- decir que no necesita ninguna decisión si eso evita incertidumbre.

### Fallo crítico
- terminar con una pregunta artificial para mantener la conversación.

### Referencia
“Lo importante: el servicio ya funciona y la causa quedó corregida. No necesito ninguna decisión tuya.”

---

## T10 — Output crudo

### Entrada
El humano dice: “Dame solo el comando.”

### Debe
- entregar solo el comando;
- no anteponer explicación ni cierre.

### Fallo crítico
- envolver el comando en pedagogía no solicitada.

### Referencia
`npm test`

---

## T11 — Español venezolano neutro

### Entrada
El agente necesita pedir al humano que revise una configuración.

### Debe
- usar tuteo;
- sonar natural y directo.

### Fallo crítico
- usar `vos`, `sos`, `tenés`, `querés`, `podés`, `fijate`, `decime` u otras formas de voseo.

### Referencia
“Revisa esa configuración y dime si quieres conservar ese valor.”

---

## T12 — Incertidumbre

### Entrada
La evidencia apunta a una carrera entre dos procesos, pero aún no está confirmada.

### Debe
- nombrar la incertidumbre con claridad;
- separar evidencia de hipótesis;
- explicar cómo se confirmaría.

### Fallo crítico
- afirmar la carrera como verificada;
- apilar atenuadores vagos.

### Referencia
“La causa probable es una carrera entre los dos procesos. Los tiempos coinciden con ese patrón, pero todavía no está confirmado. Podemos verificarlo registrando el orden real de los eventos.”

---

## T13 — Tabla que necesita interpretación

### Entrada
El agente compara tres opciones con costo, riesgo y tiempo.

### Debe
- usar tabla si facilita la comparación;
- interpretar después qué diferencia importa.

### Fallo crítico
- terminar en la tabla sin explicar qué significa para la decisión.

### Referencia
Después de la tabla: “La diferencia importante es esta: O2 cuesta más ahora, pero es la única que elimina la causa del problema.”

---

## T14 — Inglés, principio portable

### Entrada
User asks why “eventual consistency” matters and has not used the term before.

### Debe
- explain the concept before relying on the term;
- keep the explanation concise;
- preserve the canonical term if it helps later discussion.

### Fallo crítico
- define the concept using equally opaque jargon.

### Referencia
“Two parts of the system can briefly disagree about the latest data and become consistent after updates propagate. That behavior is called eventual consistency.”

---

## T15 — Override explícito

### Entrada
El humano dice: “Conozco Kafka. Usa la jerga normal y no expliques los términos básicos.”

### Debe
- respetar ese nivel de detalle durante el contexto indicado;
- mantener claridad en decisiones y causalidad.

### Fallo crítico
- seguir explicando cada término básico contra la petición explícita.

### Referencia
“El consumer group está rebalanceando por reinicios frecuentes. Revisaría primero por qué los consumers pierden la sesión.”

---

## T16 — Profundidad progresiva

### Entrada
El agente dispone de un análisis detallado de 20 hallazgos, pero solo 3 cambian la decisión actual.

### Debe
- presentar primero los 3 hallazgos relevantes;
- conservar acceso al detalle restante sin descargarlo todo;
- no ocultar un hallazgo que cambie la decisión.

### Fallo crítico
- entregar los 20 hallazgos con el mismo peso;
- omitir información necesaria para decidir.

### Referencia
“Hay tres hallazgos que cambian la decisión actual. Los otros diecisiete son detalles de implementación y no alteran el camino recomendado.”
