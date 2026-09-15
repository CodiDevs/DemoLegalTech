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

## Estructura del workspace cliente

- **Todas las tarjetas del mismo tamaño**: van de a dos (base `calc(50% - mitad del gap)`, sin crecer) y la del caso abierto pide la línea entera y muestra el trámite dentro. Ninguna se estira: la que cae sola en una línea impar queda en su columna, alineada con las de arriba, y el lugar que no ocupa queda libre. Abajo de 1101px, una por línea y el toque expande donde está el dedo.
- **Tarjetas parejas**: ninguna tarjeta lleva tratamiento propio de hero. El énfasis es el expediente abierto y su borde tintado; la urgencia la dicen el orden y la etiqueta del CTA, no el tamaño.
- **Todas las tarjetas miden igual**: un `min-height` en las de la lista y, además, la pista reserva siempre dos líneas (`2lh`). El `min-height` es un piso y no alcanza: con una pista de una línea al lado de una de dos, la primera queda más baja. Reservar el alto las iguala sin recortar el texto, y deja la línea de pasos y las especificaciones alineadas entre tarjetas.
- **Datos del expediente en la cabecera del abierto**: entre el nombre y la línea de pasos van apertura, minuta, notaría y comparecencia, repartidos en el ancho disponible. Son los mismos cuatro que antes vivían en el bloque Expediente de la ficha, que ahora muestra historial y documentos.
- **Especificaciones en la tarjeta de la lista**: debajo de la línea de pasos van el estado del paso de documentos y la fecha de apertura, que es lo que hace falta para decidir si se entra. La línea cruza el ancho del cuerpo en lugar de quedar pegada a la izquierda. El expediente abierto no las lleva porque su cabecera ya tiene los cuatro datos, y con un solo trámite no hay tarjetas, así que ese estado no las muestra.
- **Orden por urgencia**: `caseUrgency` ordena la lista de "te toca" y elige el caso abierto, así la tarjeta extendida es la primera y no la última.
- **Paso documentos en dos columnas**: subir a la izquierda, estado real de cada casillero a la derecha (archivo, fecha, peso, revisión, motivo) con el botón de continuar al fondo. Encima de 48rem; apilado abajo.
- **Cuerpo del trámite embebido**: dentro de la tarjeta extendida el desk no repite el hero (la cabecera ya lleva título, expediente, pista y estado) y sus tarjetas internas sueltan marco y sombra, para que se lea como el cuerpo de esa tarjeta y no como tarjeta dentro de tarjeta.
- **Componentes por contenedor**: una tarjeta que vive en dos anchos responde a su contenedor (`@container`), no al viewport. La contención (`container-type`) va en el envoltorio que define la columna: se consulta el ancho real que le toca al componente en cada contexto.
- **Ficha del expediente**: bajo el paso actual del desk, tres bloques con datos reales (historial, documentos, expediente). En fila cuando el contenedor llega a 48rem, apilada si no. La tarjeta de la lista lleva la línea de 5 pasos, con el estado que ya calcula `buildProductSteps`.
- **Aire deliberado, no hueco**: el escenario cinematográfico del flujo cliente (columna centrada de 44rem) y los anchos de marketing (1120/1280) se conservan.

## Checklist antes de UI nueva

- [ ] ¿Los colores salen de `tokens.scss`?
- [ ] ¿Solo Inter + Fraunces, Fraunces solo en H1/wordmark?
- [ ] ¿Teal `#2f6f68`, no indigo?
- [ ] ¿Misma densidad que páginas hermanas (cliente vs workspace)?
