# Divorcio360 product direction

## Audience

Familias que necesitan entender si un divorcio por mutuo acuerdo puede seguir un recorrido digital, y operadores jurídicos que deben revisar el mismo expediente.

## Trust rule

Este repositorio es una demostración. Clientes, integraciones, valores y plazos deben rotularse como demo salvo que CodiDevs tenga evidencia verificable y permiso de publicación.

## Visual language

- Base neutra cálida, superficies planas y teal jurídico desde `frontend/src/styles/tokens.scss`.
- Fraunces en headings e Inter en texto. Esta pareja es una excepción deliberada al filtro no-slop porque distingue contenido editorial de controles operativos.
- Sin gradientes decorativos, glassmorphism, glows, botones pill ni hover con transform.
- Radios máximos: `var(--radius-lg)` para contenedores y `var(--radius-md)` para controles.

## Motion

- Una firma expresiva: reveal circular del expediente en el hero.
- Entradas breves con opacity/transform; sin blur.
- Menús y hover usan color u opacidad entre 100ms y 200ms.
- `prefers-reduced-motion` muestra todo el contenido sin pin ni autoplay.

## Conversion

Una acción primaria por sesión:

- Guest: `Evaluar mi caso` → `/cuestionario`.
- Cliente: `Mis expedientes` → `/cliente`.
- Abogado: `Panel de casos` → `/abogado`.
