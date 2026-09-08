// Techos duros del arnes. No se agregan mas limites aqui sin que el
// humano los pida.

export const LIMITE_PRESUPUESTO_TURNOS = 60;

// Reintentos maximos por operacion fallida dentro de una tarea hija.
// Agotado el limite, el worker cierra bloqueada. Ver worker.md.
export const LIMITE_REINTENTOS_OPERACION = 2;