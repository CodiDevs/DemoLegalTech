# Divorcio360 product direction

## Register

brand

## Audience

Familias que necesitan entender si un divorcio por mutuo acuerdo puede seguir un recorrido digital, y operadores jurídicos que deben revisar el mismo expediente.

## Trust rule

Este repositorio es una demostración. Clientes, integraciones, valores y plazos deben rotularse como demo salvo que CodiDevs tenga evidencia verificable y permiso de publicación.

## Visual language

- Un idioma en el camino cliente: cream paper, Fraunces display, Inter body, teal `#2f6f68` desde `frontend/src/styles/tokens.scss`.
- Sin clay neumorphism (`.ob-neo`), sin Dribbble gray dual-shadow.
- Home privilegia Divorcio360 como trámite héroe; Traslado/BienRaiz son recortes, no tres cards iguales.

## Motion

- Demo always-on. No `prefers-reduced-motion`. Ver `.cursor/rules/demo-motion.mdc`.
- Firma expresiva: GSAP pin/clip-path en `/productos/divorcio360`, más enter de pregunta (opacity + translateY + blur) en el trámite.
- Sí/No y CTAs se mueven (transform). Custom easing `--ease-out`.
- Checkout, upload y firma heredan el mismo stage que el cuestionario.

## Conversion

Una acción primaria por sesión:

- Guest: `Evaluar mi caso` → `/cuestionario`.
- Cliente: `Mis expedientes` → `/cliente`.
- Abogado: `Panel de casos` → `/abogado`.
