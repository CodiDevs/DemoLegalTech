# Product

## Register

product

## Users

Tres roles en un walkthrough de stakeholder (Ecuador, español):

- **Cliente:** persona que inicia un trámite notarial (divorcio, traslado vehicular, inmueble). Llega desde marketing, califica en cuestionario, paga, carga documentos, firma, asiste a consulta/notaría demo.
- **Abogado / operador:** revisa expediente, aprueba documentos, genera minuta, avanza estados 01–10, usa bandeja SLA y mocks Fase 2.
- **Notario:** cierra el expediente en reunión virtual demo.

Contexto: demo de producto, no producción. El usuario está cansado, en el teléfono o en una mesa de bufete, y no debe adivinar la marca.

## Product Purpose

**LegalStation** es la plataforma SaaS multi-producto. **Divorcio360** es el flujo live; Traslado360 y BienRaiz360 son sitios de producto con cuestionario. Pagos Payphone y firma documental son demostraciones.

Éxito: un stakeholder recorre `/` → producto → cuestionario → auth → expediente sin preguntar “¿esto es otro sitio?”. Identidad visual única (Sora + teal legal-ops). Copyright de footer: `© 2026 CodiDevs · Demo LegalStation` (no añadir “Hecho por CodiDevs” salvo que el fundador lo pida).

## Brand Personality

Quiet Quito evening desk. Tres palabras: **preciso, sereno, operacional**.

Voz: español claro, términos legales solo cuando el trámite los exige, slogan canónico *Servicios jurídicos al mismo costo, sin filas ni trámites.* Confianza de bufete, no urgencia de ads. Marketing sigue al producto, no al revés.

## Anti-references

- Clon Talking Tree (cream + Inter + indigo `#4455c4`).
- Tres sistemas a la vez (Inter / Fraunces / Sora; cream / teal; isla hero `#0d0f0d` en página clara).
- SaaS slop: métricas inventadas en el hero, cejas uppercase en cada sección, 7 cards idénticas de “producto”, CTA con cuatro nombres para la misma acción.
- Footer de 4 columnas en wizard y auth.
- Glassmorphism, gradient text, navy-gold “legal cliché”.

## Design Principles

1. **Una identidad.** Tipo, color y CTA vienen de `tokens.scss`. Landings de producto no inventan acento azul o marrón.
2. **El trámite es el foco.** En wizard, un paso, un footer corto, un CTA.
3. **Mostrar el expediente, no el pitch.** Catálogo marketing existe para entrar a Divorcio360, no para competir con el flujo.
4. **Salidas visibles.** Skip-link, 404 real, volver, labels en auth.
5. **Demo honesta.** Honorarios y “firmas demo” no se disfrazan de métricas de mercado.

## Accessibility & Inclusion

Piso WCAG AA: contraste body ≥4.5:1, `:focus-visible` en tokens, skip-link al `#main`, inputs con `for`/`id`, `prefers-reduced-motion` en animaciones, títulos de documento por ruta. Español `lang="es"`. No transmitir estado solo con color (Sí/No del cuestionario necesita más que verde/rojo).
