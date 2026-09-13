# LegalStation — design

Un idioma. Si una pantalla se ve de otro producto, está mal.

Fuente de verdad: `frontend/src/styles/tokens.scss`. No inventar paleta, tipo ni easing en el componente.

## Tipo

| Uso | Familia | Cómo |
| --- | --- | --- |
| Cuerpo, UI, h2+ | Inter | `font-family: var(--font-sans)` |
| Display | Fraunces | `font-family: var(--font-display)` **solo** en H1 de página y wordmark |

Cargadas en `frontend/src/index.html`. Prohibido: Sora, Geist, Outfit, otra Google Font, `system-ui` suelto en un componente.

`h1–h6` en tokens van Inter a propósito. Fraunces se aplica a mano en el H1, no en títulos de card.

## Color

- Papel: `--bg` / `--bg-subtle` (cream `#fcfcfb` / `#f7f7f5`)
- Tinta: `--text` `#2b2824`
- Marca: `--primary` **`#2f6f68`**. Hover `--primary-hover`. Soft `--primary-subtle`
- Estados: `--success` / `--warning` / `--danger` / `--info` del token file

Prohibido: indigo `#4455c4`, purple AI, gradiente de marca, `--lp-accent` hardcodeado a otro hex.

## Superficie

- Card/panel: `--surface`, borde `--border`, radio `--radius-lg` (14px), sombra `--shadow-sm`/`--shadow-md`
- Controles: altura `--control-height`, radio `--radius-md`
- No clay neumorphism (`.ob-neo`, doble inset gris)

## Dos densidades, mismo idioma

1. **Cliente** (home → producto → cuestionario → checkout/upload/firma): más aire, Fraunces grande, motion cinematográfico.
2. **Workspace** (`/abogado`, `/cliente` logueado): más denso, Inter dominante, H1 sigue Fraunces, mismo teal.

No un tercer look para Fase 2.

## Motion

Siempre on. Ver `.cursor/rules/demo-motion.mdc`.

- `transform` + `opacity` + `filter`, easing `--ease-out`
- Nunca `prefers-reduced-motion` ni nuke de `animation-duration`

## Checklist antes de UI nueva

- [ ] ¿Los colores salen de `tokens.scss`?
- [ ] ¿Solo Inter + Fraunces, Fraunces solo en H1/wordmark?
- [ ] ¿Teal `#2f6f68`, no indigo?
- [ ] ¿Misma densidad que páginas hermanas (cliente vs workspace)?
