// src/helpers/formatAnswer.ts

/**
 * Devuelve true si la respuesta está realmente vacía
 * (null, undefined o solo espacios).
 */
export function isEmptyAnswer(value: unknown): boolean {
    if (value === null || value === undefined) return true;
    const str = String(value).trim();
    return str.length === 0;
  }
  
  /**
   * Formatea una respuesta para mostrarla en pantalla:
   * - trim()
   * - si está vacía, devuelve ""
   * - si tiene texto, pone la primera letra en mayúscula
   *   y el resto en minúscula.
   *
   * Ejemplos:
   * - "turqueSA"   -> "Turquesa"
   * - "  san toDomingo  " -> "San todomingo" (simple, solo capitaliza la primera letra global)
   *
   * La idea es que se vea ordenado, pero sin
   * cambiar demasiado lo que el jugador escribió.
   */
  export function formatAnswer(value: unknown): string {
    if (isEmptyAnswer(value)) return "";
  
    const raw = String(value).trim();
  
    if (raw.length === 0) return "";
  
    const first = raw.charAt(0).toUpperCase();
    const rest = raw.slice(1).toLowerCase();
  
    return first + rest;
  }
  
  /**
   * Helper para mostrar algo amigable cuando está vacío.
   * Puedes usarlo en la UI si quieres centralizar el texto "(vacío)".
   */
  export function formatAnswerOrEmptyLabel(
    value: unknown,
    emptyLabel: string = "(vacío)"
  ): string {
    const formatted = formatAnswer(value);
    if (!formatted) return emptyLabel;
    return formatted;
  }
  