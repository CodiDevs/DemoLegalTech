# LegalStation — Agent Directives & Design Anti-Patterns

Directivas obligatorias para cualquier modificación de interfaz, componentes o diseño en LegalStation.

---

## 1. Titulares y Redacción (Copywriting)

* **Titulares cortos y asertivos (H1):** Máximo 3 a 5 palabras en tipografía `Fraunces`.
  * ✅ **Aprobado:** `Expedientes civiles, resueltos.`
  * ❌ **Prohibido:** Titulares largos, verbosos o explicativos típicos de IA (ej: *"El software que convierte trámites civiles en expedientes resueltos y cobrados"*).
* **Propuesta de valor:** Una sola oración directa en `Inter` (máximo 2 líneas), sin relleno ni lenguaje inflado (*"supercharge"*, *"revoluciona"*, *"la solución definitiva"*).
* **Términos del producto:** Usar *"de ejemplo"* o *"ficticio"*; evitar rotular como *"DEMO"* en copys de cara al cliente.

---

## 2. Prohibición de Clichés y Assets Típicos de IA (Anti-AI-Slop)

Queda terminantemente prohibido generar o incluir los siguientes patrones de plantilla de IA:

* ❌ **Pills con punto parpadeante:** Badges tipo píldora con micro-dots animados en verde/teal (*"Plataforma B2B · En vivo"*).
* ❌ **Tiras horizontales de 3 métricas sintéticas:** Grillas de estadísticas inventadas (*"-80% tiempo / 100% validez / 0 hs"*).
* ❌ **Listas de garantías con checkmarks:** Bloques de viñetas genéricas con icono check (*"✓ Sin costo de setup / ✓ Soporte 24/7"*).
* ❌ **Barras de telemetría de ciencia ficción:** Cabeceras con códigos de expediente parpadeantes o estética cyber (*"LS-EXP-014 · Operación en curso"*).
* ❌ **Retículas láser / wireframes digitales:** Fondos con cuadrículas milimétricas sci-fi o renders 3D isométricos de IA.

---

## 3. Fondos y Atmósfera (Material Honesty)

* **Superficie limpia y orgánica:** Usar texturas sobrias de papel mate, lienzo pizarra (`#121413`) o cream (`#fcfcfb` / `#f7f7f5`) con degradados de iluminación natural en teal de marca (`#2f6f68`).
* **Sin temáticas incongruentes:** No utilizar fotos o videos de bibliotecas de madera clásicas, estantes de libros antiguos ni estética de bufete del siglo XIX.
* **Dejar que la UI real venda:** El protagonismo visual debe ser la propia interfaz del trámite (`DemoCaseWindowComponent`, documentos, minutas), limpia y sin cajas o marcos decorativos redundantes.

---

## 4. Sistema de Diseño y Motion

* **Contrato visual:** `docs/design.md` y `frontend/src/styles/tokens.scss`.
* **Tipografía:** `Fraunces` **únicamente** en H1 y wordmark. Todo el resto en `Inter`.
* **Colores:** Teal `#2f6f68` como único acento primario. No índigo `#4455c4`, no morados de IA.
* **Motion:** Siempre activo, cinemático (`--dur-cine`, `--ease-out`, `transform + opacity + filter`). Nunca desactivar ni atenuar con `prefers-reduced-motion`.
