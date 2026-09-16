# Demo goals log

Checklist of shipped vertical slices for the Divorcio360 client demo.

| Status | Goal | How to demo | Date |
|--------|------|-------------|------|
| done | Cobros de trámites en Escritorio | `abogado@demo.ec` → rail **Escritorio**: tabla Cobros de trámites (cobrado/pendiente). **Facturación B2B** = licencia/planes, sin honorarios por caso | 2026-09-16 |
| done | Asistente de bandeja, no OCR | `abogado@demo.ec` → Asistente de revisión: chip **¿Cuál va primero?** — ingreso/etapa/quién espera. No dice que leyó el PDF | 2026-09-16 |
| done | API en Render + SPA en Vercel | https://legalstation.vercel.app — Ingresar `abogado@demo.ec` / `demo1234` (o `cliente@demo.ec`). `/api` va a `legalstation-api.onrender.com`. Free: primer hit tras sleep puede tardar ~45s | 2026-09-16 |
| done | Frontend en Vercel | Abrir https://legalstation.vercel.app — home + landings | 2026-09-16 |
| done | Divorcio360 hero sin folio pin | `/productos/divorcio360`: H1 + CTAs. Sin círculo, sin mock de etapas | 2026-09-16 |
| done | Escritorio con cifras de ejemplo | `abogado@demo.ec` → **Escritorio**: libros Tu práctica + La página (honorarios, visitas, barras de la semana) y debajo el folio que te toca. Cifras inventadas, rotuladas de ejemplo | 2026-09-16 |
| superseded | Escritorio (dashboard) vs Facturación B2B | Cobros de trámites pasaron a Escritorio (2026-09-16). Facturación B2B queda en licencia | 2026-09-16 |
| superseded | Resumen y Facturación B2B son módulos distintos | Sigue aparte el rail; los cobros por trámite viven en Escritorio, no en billing | 2026-09-16 |
| done | Lenguaje visual P0 + colofón CodiDevs | `/` H1 «Expedientes civiles, resueltos.» + catálogo Divorcio protagonista + pie «Hecho por CodiDevs». Traslado/BienRaiz misma cámara. `/cuestionario` folio + colofón. Checkout una acta. Firma: QR sin tarjeta. `/auth` tres líneas. `/cliente` y `/abogado` sello en el rail | 2026-09-15 |
| done | Cuestionario se guarda en el navegador | `/cuestionario` responde 2 → Inicio → vuelve: sigue en la misma pregunta | 2026-09-15 |
| done | Rail del despacho hover | `abogado@demo.ec` → `/abogado`: folio quieto; hover revela texto; candado Fijar deja el menú abierto (F5 lo recuerda) | 2026-09-15 |
| superseded | Bandeja fusiona Resumen + cobros en licencia | Revertido 2026-09-16: Resumen vuelve al rail; cobros siguen en Facturación B2B | 2026-09-15 |
| done | Cliente sin Próximamente | `/cliente` sidebar: Todos + live. Sin SignDesk/MatterFlow/ComplianceHub/NotaryLink | 2026-09-15 |
| done | Barra del cuestionario se puede volver | `/cuestionario` responde una → “Clic en un paso hecho para volver” → clic en el tramo teal | 2026-09-15 |
| done | Hero elige trámite en home | `/` → Iniciar un trámite abre Divorcio/Traslado/BienRaíz; `/productos/divorcio360` sigue al cuestionario | 2026-09-15 |
| done | Subtítulos solo si aportan dato | `/` catálogo/FAQ sin lede; Precios sí. `/cuestionario` pregunta sin pista bajo el H1. `/firma/:id` título solo. `/cliente` sin “Qué te toca ahora” si la lista ya lo dice | 2026-09-15 |
| done | Sello QR LegalStation | `cliente@demo.ec` → `/firma/:id`: QR (no rúbrica), pagar $15, Descargar o Aplicar a la minuta | 2026-09-15 |
| done | Asistente expediente real + Enviar a la vista | `abogado@demo.ec` → Asistente: select `#id · producto · etapa` (no fuerza #1); Enviar queda en el pliegue | 2026-09-15 |
| done | Despacho Facturación + Modelos + Servicios | `abogado@demo.ec` → Licencia: tabla de planes (no 3-up); Modelos: Familia no FAMILIA; Servicios: tabs sin 2/2/0 ni slug | 2026-09-15 |
| done | Despacho Resumen + expediente destilado | `abogado@demo.ec` → `/abogado/fase2/admin`: Te toca, no 4 KPIs; Detenidos → bandeja con filtro de etapa; `/abogado/caso/6` etapas con nombre, Q cerrado, un primary; Asistente H1 + icono search | 2026-09-15 |
| done | Despacho /abogado (chrome + bandeja folio) | `abogado@demo.ec` → `/abogado`: sin Cómo funciona/Precios ni footer; filas con verbo; filtro Revisión dice “Hay N en la bandeja” | 2026-09-15 |
| done | Guest cuestionario, auth al cobrar | Logout → `/productos/divorcio360` → Iniciar Formulario → `/cuestionario`; resultado → cuenta para pagar | 2026-09-15 |
| done | Anti-slop F2+F3 | `/` — sin 24h ni “expediente real”; pilares 2+1; checkout plano | 2026-09-15 |
| done | Hero expediente plano + pasos | `/` — folio derecho recto; clic en 1–6 cambia Estado y titular | 2026-09-15 |
| done | Bootstrap repo | `README.md` — `go run ./cmd/api` + `npm start` | 2026-08-29 |
| done | Auth + seed users | Login `cliente@demo.ec` / `abogado@demo.ec` (`demo1234`) | 2026-08-29 |
| done | Cuestionario inteligente | Landing → Cuestionario → green/yellow/red | 2026-08-29 |
| done | Pago mock + carga docs | Green path → Payphone mock $349 → cédula + partida | 2026-08-29 |
| done | Paneles cliente/abogado | Advance states 01–10; client timeline | 2026-08-29 |
| done | Firma electrónica mock | Canvas firma; evidence fecha/hora/IP on expediente | 2026-08-29 |
| done | Fase 2 mocks | Abogado → Fase 2 → six backlog screens | 2026-08-29 |
| done | Panel abogado creíble | `/abogado` filtros → `/abogado/caso/1` revisar docs, minuta, acciones | 2026-08-29 |
| done | Fase 2 pulida + UX por rol | Abogado sin cuestionario; Fase 2 shell rico; bandeja/workspace pro; cuestionario onboarding | 2026-08-29 |
| done | LegalStation UI Talking Tree + hero scroll | `/` hero SVG scroll, header 3 cols, carrusel, español | 2026-08-29 |
| done | Demo audio: por uso + 3 roles + productos lite | Walkthrough 12 min — licencia bufete, Traslado360/BienRaiz360, notario, UI unificada | 2026-08-30 |
| done | Audio gaps: slogan + sitios producto + reuniones | Walkthrough 15 min — Traslado360/BienRaiz360 completos, consulta/notaría mock | 2026-08-30 |
| done | Firma virtual + flujo operador | notify sin cambio estado; confirm solo con firma en 05; can_sign autónomo cliente | 2026-08-30 |
| done | Flujo documental multi-producto | Traslado360 carro: upload matrícula+acuerdo → abogado aprueba → minuta → firma; blockers por etapa | 2026-08-30 |
| done | Upload documentos UX | Checklist + dropzone por producto; reemplazar sin borrar; abogado ve solo última versión | 2026-08-30 |
| done | Cuestionario UX progreso estático | `/cuestionario` — barra superior quieta; preguntas entran desde abajo | 2026-09-02 |
| done | Marketing UI polish Fase 0+1 | `/productos/divorcio360` Fraunces + teal AA + mock expediente + 6 pasos | 2026-09-03 |
| superseded | Marketing UI polish Fase 2 | `/` collage + badges — replaced by Home `/` no-slop | 2026-09-03 |
| superseded | Divorcio360 landing UI/UX | `/productos/divorcio360` hero pin con mock, CTAs por sesión, band de stats | 2026-09-06 |
| done | Divorcio360 no-slop repair | `/productos/divorcio360` — CTA above-fold, una demo, copy honesto, legales | 2026-09-06 |
| done | Cuestionario no-slop | `/cuestionario` — sin atmósfera, progreso teal, header sólido, Atrás en resultado | 2026-09-06 |
| done | Home `/` no-slop | `/` — un hero, catálogo live, CTA por rol, sin collage/KPIs/gallery | 2026-09-08 |
| done | Fase 2 admin no-slop | `abogado@demo.ec` → `/abogado/fase2/admin` — tabla de casos, métricas honestas, sin KPI theater | 2026-09-08 |
| done | Frontend audit polish | Copy producto; sidebar abogado+Fase2 unificado; pricing/stats 2-up; Divorcio360 Legora-like | 2026-09-10 |
| done | LegalStation landing premium | `/` hero video + brand lockup; secciones/container unificados; cards 3-up | 2026-09-10 |
| done | Landing layout polish | Precios 3-up; cards elevadas; a.btn hover fix; secciones soft diferenciadas | 2026-09-10 |
| done | Cards shine / tilt / FAQ | `/` productos 3D, Professional shine, FAQ post-precios; sin `#sistema` | 2026-09-10 |
| done | Expediente CaseProgress ES | `/#flujo` + `/caso/:id` Línea de estados; mismo componente multi-producto | 2026-09-10 |
| done | CaseProgress fix + Auth system | `#flujo` sin overlap; `/auth` layout + forgot demo | 2026-09-10 |
| done | Plantillas Fase 2 editables | `abogado@demo.ec` → Modelos de documentos → Duplicar → editar → F5 | 2026-09-10 |
| done | Cuestionario Divorcio360 neo | `/cuestionario` clay teal, Sí/No hundidos, contraste AA | 2026-09-10 |
| done | Demo cliente máximo movimiento | `/` video → Divorcio360 pin → cuestionario → pago → docs → firma | 2026-09-11 |
| done | Recorrido cinematográfico Expediente vivo | `/` tráiler → Divorcio360 cámara → `/cuestionario` → `/checkout/:id` → `/upload/:id` → `/firma/:id` | 2026-09-11 |
| done | Client journey handoff fixes | Guest product Q → auth(`next=checkout`) → expediente; unpaid → checkout; Mis expedientes por producto | 2026-09-13 |
| done | Client journey visual language | Traslado/BienRaiz teal; cuestionario sheet; header Fraunces; botones trámite | 2026-09-13 |
| done | Home y product homes design.md | `/` + Divorcio/Traslado/BienRaiz: cream cards, grid de estaciones, mock plano | 2026-09-13 |
| done | Firma plataforma vs documento propio | `/firma/:id` — subir PDF propio ($0) o firma LegalStation $15 aparte (Payphone mock) | 2026-09-13 |
| done | Flujo cliente Iniciar Formulario + firma canvas | Header/hero CTA con login; upload compacto; lienzo LegalStation → $15; recibo de la sesión | 2026-09-13 |
| done | Módulo de servicios del abogado | `abogado@demo.ec` → Servicios → editar Denuncia electrónica o crear una oferta nueva | 2026-09-13 |
| done | Login → panel por rol | `/auth` login cliente → `/cliente`; abogado → `/abogado`; deep links (cuestionario/checkout) intactos | 2026-09-13 |
| done | Header menú cuenta + Salir | Login → clic en nombre (Carlos) → menú con panel + Salir (icono); sin Salir suelto en la barra | 2026-09-13 |
| done | Portal /cliente expediente | `/cliente` — hoja Te toca + CTA Firmar; filtros densos; archivo compacto (sin KPI cards) | 2026-09-13 |
| done | Sidebar servicios unificado | `/cliente` — rail de servicios; un solo panel; filtrar Divorcio/Traslado/BienRaíz | 2026-09-13 |
| done | Header SaaS en /cliente | Marca LegalStation (no Divorcio360); sin Iniciar Formulario en el panel unificado | 2026-09-13 |
| done | Branding flujo multi-producto | `/cliente` Traslado #6 → Subir: cabecera Traslado360 + crumb Mis trámites | 2026-09-13 |
| done | Divorcio360 timeline in-panel | `/cliente` → Divorcio360: sidebar con pasos; content dossier sin salir del panel | 2026-09-13 |
| done | Traslado360 timeline in-panel | `/cliente` → Traslado360: mismo timeline + desk (matrícula/acuerdo) | 2026-09-13 |
| done | Header LegalStation estable | Marca siempre LegalStation; nav Inicio/Cómo funciona/Precios fijo entre productos | 2026-09-13 |
| done | Editor servicios grafo | `/abogado/servicios` → lienzo n8n + seed Divorcio360 mutuo con flujo completo | 2026-09-14 |
| done | Masthead folio /abogado | `abogado@demo.ec` → Bandeja/Servicios/Resumen: título Fraunces + aside operativo + regla teal | 2026-09-14 |
| done | Bandeja búsqueda + filtros | `/abogado` — busca por nombre/#; Servicio + Estado (Revisión preseleccionado); 10/página | 2026-09-14 |
| done | Precios toggle Servicios/Licencia | `/#precios` — toggle; Servicios = honorarios $349/$199/$299; Licenciamiento = planes mes | 2026-09-14 |
| done | Expediente abogado dossier denso | `abogado@demo.ec` → `/abogado/caso/4` — cabecera tipográfica + tabs; pendientes en rail derecho | 2026-09-14 |
| done | Marketing sin AI slop | `/` + Divorcio/Traslado/BienRaiz sin tiras de métricas, checkmarks, testimonios, kickers ni códigos falsos | 2026-09-15 |
| done | Cuestionario rearmado + resto sin slop | `/cuestionario` con hoja y progreso únicos; KPIs de Fase 2 honestos; inglés y em-dash fuera | 2026-09-15 |
| done | Cierre anti-slop: estados, paleta, muertos | 10 estados desde una fuente; 6 scrims, 2 verdes y 6 acentos a tokens; 11 componentes muertos fuera | 2026-09-15 |

## Entries

### 2026-09-16 — Cobros de trámites en Escritorio
Los honorarios por caso (tabla cobrado/pendiente) salen de Facturación B2B y vuelven al **Escritorio** (antes Resumen). Billing queda en licencia de bufete: plan, cupo, link de cliente, historial de facturas.

**Demo:** `abogado@demo.ec` / `demo1234` → rail **Escritorio** (`/abogado/fase2/admin`) → bajar a **Cobros de trámites** (`$… cobrado · $… pendiente`, un `#` abre el expediente). Rail **Facturación B2B**: planes e historial, sin esa tabla.

### 2026-09-16 — Asistente de bandeja, no OCR
El Asistente de revisión deja de fingir que lee PDFs. Responde con la bandeja: etapa, fecha de ingreso, días en estado y quién espera (abogado vs cliente). Chips: pendiente, cuál va primero, quién espera. `POST /mock/ai/analyze` y `/mock/ai/chat` usan la misma bandeja; sin cruce cédula/partida.

**Demo:** `abogado@demo.ec` / `demo1234` → Asistente de revisión → **¿Cuál va primero?** (el más viejo de ingreso / fuera de plazo) → pregunta «¿Qué dice el PDF?» y comprueba que no inventa contenido.

### 2026-09-16 — Escritorio con cifras de ejemplo
El dashboard del despacho lleva dos libros: **Tu práctica** (honorarios, neto, mix) y **La página** (visitas, trámites, cierre). Todo es ficticio, rotulado «de ejemplo». Debajo sigue el folio que te toca y Detenidos. Facturación B2B no se fusiona.

**Demo:** `abogado@demo.ec` / `demo1234` → rail **Escritorio**. Ver $7.396 cobrados y 1.158 visitas; barras lun–dom; luego el expediente de hoy.

### 2026-09-16 — Escritorio, el dashboard del despacho
Resumen deja de ser un informe. El rail dice **Escritorio**. La pantalla responde “qué me toca hoy”: el folio de delante es el expediente, no un KPI.

- **Escritorio** `/abogado/fase2/admin`: H1 «Hoy te toca.» (o «Nada te toca.» si el siguiente sello no es del abogado) + folio grande y los tres siguientes. Si hay más, lista corta **En espera** / **También en el escritorio**. **Detenidos** son chips centrados con el conteo en el bloque; clic abre la bandeja con `?estado=`. Link quieto a Facturación B2B. Sin 4 tarjetas, sin cobros, sin planes.
- **Facturación B2B** `/abogado/fase2/billing`: cobros, licencia e historial. Sigue aparte.

**Demo:** `abogado@demo.ec` / `demo1234` → rail **Escritorio** (folio grande → expediente) → chip Detenidos → Bandeja filtrada → rail **Facturación B2B**. El chrome (WorkspaceHead, hover rail, «Hecho por CodiDevs») no se pierde.

### 2026-09-16 — Resumen y Facturación B2B, módulos aparte
El despacho deja de meter el resumen del bufete en la bandeja. **Resumen** y **Facturación B2B** son destinos distintos: rail, ruta y pantalla.

- **Resumen** `/abogado/fase2/admin`: masthead + **Te toca** (folios, no 4 KPIs). Detenidos abre la bandeja con `?estado=`.
- **Facturación B2B** `/abogado/fase2/billing`: Cobros de trámites (tabla cobrado/pendiente) + planes de licencia + historial. Sin tabla de cobros dentro de Resumen.

**Demo:** `abogado@demo.ec` / `demo1234` → `/abogado` (Bandeja, Detenidos intacto) → rail **Resumen** (Te toca, un `#` abre expediente) → rail **Facturación B2B** (Cobros de trámites). El chrome del despacho no se pierde al cambiar.

### 2026-09-15 — Lenguaje visual P0 + colofón CodiDevs
Una cámara en todo el recorrido cliente: cream, Fraunces en H1, teal, motion `--dur-cine`. El cierre es «Hecho por CodiDevs» (Inter + Fraunces), no un span ALL-CAPS.

**Demo:** `/` 3 s — titular corto, Divorcio más aire, estaciones rail+título, colofón de marketing. `/productos/divorcio360` y `/productos/traslado360` misma gramática (escena + DemoCaseWindow). `/cuestionario` y `/productos/traslado360/cuestionario`: sellos Sí/No, sin Paso N, colofón folio. Checkout una hoja con honorarios al margen. Upload renglones. Firma: QR como sello. `cliente@demo.ec` → `/cliente` y `abogado@demo.ec` → `/abogado`: sello CodiDevs al pie del rail.


### 2026-09-15 — Cuestionario se guarda en el navegador
Cada respuesta del cuestionario (Divorcio360 y Traslado/BienRaíz) queda en `localStorage`. Cerrar la pestaña o ir a otra página no borra el avance. El expediente creado sí limpia el borrador.

**Demo:** `/cuestionario` → Sí → Sí → `/` → `/cuestionario`: sigue en la tercera pregunta, con las dos primeras marcadas.

### 2026-09-15 — Cliente sin Próximamente
El rail de `/cliente` solo lista trámites vivos. SignDesk y el resto `live: false` no ocupan el pliegue.

**Demo:** `cliente@demo.ec` → `/cliente` → sidebar sin bloque Próximamente.

### 2026-09-15 — Bandeja come Resumen; cobros en licencia
Resumen salió del rail. `/abogado/fase2/admin` abre la bandeja. Detenidos son atajos de etapa (conteo · días) sobre la lista. Lo cobrado a clientes vive en Facturación B2B: una línea cobrado/pendiente y las filas del trámite, aparte de las facturas de la licencia.

**Demo:** `abogado@demo.ec` → Bandeja (clic en Detenidos) → Facturación B2B (Cobros de trámites) → un `#` abre el expediente.

### 2026-09-15 — Rail del despacho hover
El aside de `/abogado` no es un panel blanco. El folio reserva el ancho abierto: hover revela el texto en ese hueco; al salir las etiquetas se van y **la página no se recorre**. El candado de abajo (**Fijar**) deja el menú abierto y se recuerda al recargar.

**Demo:** `abogado@demo.ec` → `/abogado` → hover el rail → candado Fijar → F5: el texto sigue.

### 2026-09-15 — Barra del cuestionario se puede volver
Los tramos hechos ya eran un hit. Ahora se leen: más gruesos, cursor, hover, y la línea “Clic en un paso hecho para volver”.

**Demo:** `/cuestionario` → Sí → clic en el primer tramo teal → vuelve a “¿Los dos quieren divorciarse?”.

### 2026-09-15 — Hero elige trámite en home
En LegalStation el CTA del hero ya no clava Divorcio360. Se abre la lista de trámites vivos. En cada sitio de producto, el CTA sigue al cuestionario.

**Demo:** `/` → Iniciar un trámite → Traslado360. `/productos/divorcio360` → Iniciar Formulario → `/cuestionario`.

### 2026-09-15 — Subtítulos solo si aportan dato
El H1/H2 no arrastra un párrafo de relleno. Se queda el lede si trae precio, cupo, restricción o el siguiente paso. Fuera: parafraseo del título.

**Demo:** `/` catálogo y FAQ sin lede; Precios sí (pago único vs licencia). `/cuestionario` solo la pregunta y Sí/No. `/firma/:id` título solo. `/cliente` sin “Qué te toca ahora” si la lista ya lo dice.

### 2026-09-15 — Sello QR LegalStation
La firma electrónica del SaaS no es una rúbrica dibujada. Es un QR (`sello-qr.png`) de verificación: se paga $15, se descarga o se aplica a la minuta. El QR queda sobre el PDF.

**Demo:** `cliente@demo.ec` → `/firma/:id` con minuta → Pagar $15 y obtener QR → Descargar y/o Aplicar a la minuta.

### 2026-09-15 — Asistente expediente real + Enviar a la vista
El select deja de clavar el caso `#1`. Abre el primero del sort (Revisión primero). Cada opción es `#id · producto · etapa`, porque el seed usa un solo cliente. El compositor (Enviar) queda dentro del viewport: el chat llena el alto del despacho y el log es el que scrollea. Bandeja: solo fuera de plazo lleva lavado; “te toca” ya está en el verbo de la fila.

**Demo:** `abogado@demo.ec` → Asistente de revisión → cambiar de expediente en el select → Enviar visible sin bajar. Bandeja: fila con “Fuera de plazo” en ámbar, el resto sin teal.

### 2026-09-15 — Despacho Facturación + Modelos + Servicios
Licencia deja el 3-up SaaS: una tabla (precio, operadores, casos, asistente, SATJE). Modelos: categoría en Inter normal, chips cuadrados. Servicios: tabs Todos/Publicados/Borradores; conteo solo en el masthead; sin `/slug` en la tarjeta.

**Demo:** `abogado@demo.ec` → Facturación B2B (tabla, plan actual marcado) → Modelos → Servicios.

### 2026-09-15 — Despacho Resumen + expediente destilado
Resumen deja el teatro de 4 KPIs: una línea en el masthead y la lista **Te toca**. Detenidos es una lista quieta: clic abre la bandeja con `?estado=` de esa etapa. Expediente muestra etapas con nombre (Recepción, Revisión, Minuta…), cuestionario cerrado y filtrado (sin tenencia si no hay hijos), y un solo `btn-primary`. Asistente: H1 «Asistente», icono search en el rail.

**Demo:** `abogado@demo.ec` → Resumen → un folio de Te toca → expediente #6 (chips con nombre, abrir Cuestionario) → Asistente de revisión.

### 2026-09-15 — Despacho /abogado (chrome + bandeja folio)
`/abogado/**` deja de ser landing con sidebar. Header: marca → bandeja, campana, Dra. Sin Servicios/Inicio/Cómo funciona/Precios ni pie de productos. Bandeja sigue marcada en `/abogado/caso/:id`. Inbox abre en todos los estados; filtro vacío dice “Ninguno en Revisión. Hay N en la bandeja.” Filas folio: número, nombre, ciudad, verbo, días. Sin cajita de icono, sin 10 pips, sin “Abrir”, sin hover que empuja.

**Demo:** login `abogado@demo.ec` → `/abogado` (lista con trabajo) → un expediente (Bandeja sigue on) → filtro Estado Revisión (empty honesto → Ver todos). Home `/` sigue con nav de marketing.

### 2026-09-15 — Guest cuestionario, auth al cobrar
**Iniciar Formulario** (invitado) va a `/cuestionario`, no a `/auth`. El resultado apto pide cuenta para pagar (`next=checkout`); checkout sigue con `authGuard`.

**Demo:** logout → `/productos/divorcio360` → Iniciar Formulario → completar cuestionario → Crear cuenta para pagar / Ya tengo cuenta → checkout.

### 2026-09-15 — Anti-slop F2+F3
Guard de marketing ahora falla si reaparecen `.ls-choreo` / `.ls-plan-items`, claims `24h` / `expediente real` / `en minutos`. CSS muerto de home vieja (rail, license-plate, `&.legalstation-landing`) fuera. Home: CTA de ejemplo, pilares asimétricos, plan Professional con tag `10 operadores` (badge Recomendado una sola vez), minuta sin `border-left`. Checkout sin `rotateY`.

**Demo:** `/` → flujo + precios Professional → `/checkout/:id` folio plano. `/productos/traslado360` heads a la izquierda.

### 2026-09-15 — Hero expediente plano + pasos
El mock de `/` iba torcido (`perspective` + `rotateX/Y`) y el copy decía “expediente de ejemplo”. Ahora es un folio plano. Cada fila es un botón: el titular y el Estado siguen el paso activo, con fade+blur.

**Demo:** `/` → hover el botón 1 activa Estado 01; hover 4 activa 04. Clic o foco igual. Misma ventana en `/productos/divorcio360` escena Flujo.

### 2026-09-15 — Cierre anti-slop: estados, paleta, muertos
Segunda pasada del cierre. Detalle completo en [`docs/NO_SLOP.md`](NO_SLOP.md).

- **Estados**: 6 definiciones y 4 vocabularios para los mismos 10 estados → `shared/case-status.data.ts` (`short`, `clientHint`, `lawyerHint`, `filterLabel`) consumido por `client-panel`, `lawyer-panel` y `lawyer-case`. Se unificó también la lista de códigos (`STATE_KEYS` era un tercer origen). Guard nuevo: `case-status.data.spec.ts`.
- **Paleta**: tokens `--overlay`/`--overlay-strong`; `--shadow-md`/`--shadow-lg` a una capa; `case-detail` migrado de 5 `oklch()` + `white` + tokens viejos a los de estado; `#2f7d51` → `#2b7749` (eran dos verdes); `#faf7f0` → `--bg-subtle`; confeti del recibo a paleta de marca.
- **Tells**: `backdrop-filter` fuera del header y de los 3 overlays; los 6 `border-left` de acento de 3-4px pasaron a tinte de fondo o badge; sheen infinito del segmento activo borrado.
- **Muertos**: 11 componentes y sus carpetas (incluido `fase2-shell` + `mock-badge` y `route-curtain` + `cinematic-path` con sus specs) más el CSS huérfano (`.lp-values`, `.lp-list-tt`, `.container-narrow`, `.btn-accent`, `.badge-demo`).
- **Copy**: em-dash fuera en expediente, pasos del cliente y grafo de servicios; placeholders `'—'` → `'Sin indicar'`.

**Demo:** `abogado@demo.ec` → `/abogado` y `/abogado/caso/1` (estados y acentos), `cliente@demo.ec` → `/cliente`. Verificación: `bun run build:frontend` y `bun run test:frontend` (109 specs).

### 2026-09-15 — Cuestionario rearmado + resto del frontend sin slop
El cuestionario no estaba solo feo: estaba roto. Un folio vertical "01 / 09", una hoja de 608px con ~300px de vacío, y un documento SVG con sello de agua desbordándose por detrás. Detalle completo en [`docs/NO_SLOP.md`](NO_SLOP.md).

**Causas**
- `onboarding.scss` estilizaba `.ob-card` (21 reglas), un componente que ningún template usa: los cuestionarios usan `.ob-sheet` (estilado en `cinematic.scss`). Las reglas de veredicto `is-apto/is-evaluacion/is-no_aplica` apuntaban al fantasma, así que el borde de color del resultado nunca se aplicaba. Se portaron a `.ob-sheet`.
- `/* Questionnaire monument */ .theme-divorcio .ob { max-width: 72rem }`: un formulario de una pregunta a 1152px de ancho.
- Diez capas decorativas detrás de una pregunta.

**Cambios**
- Stage de 10 capas a 3 (papel, una luz, renglones). Fuera barrido, sello, viñeta y las 5 "washes" por categoría.
- Una sola lectura de progreso: se elimina el folio vertical y el hint redundante.
- Hoja con `--radius-lg` y `--shadow-md` de una capa; `min-height` de `min(70vh, 38rem)` a `min(46vh, 24rem)`; bloque centrado.
- `--max-width` del formulario a 40rem (44rem en pantallas grandes).
- Botones Sí/No sobrios (4.5rem, un estado) sin barrido, `translateX` ni anillo-sello.
- Igual en `product-questionnaire`.
- KPIs de Fase 2 sin defaults inventados (`|| 21595`, `|| 94`, `|| 18.4`, `|| 14`, `|| 8`, `|| 64`) ni `SLA objetivo: ≤ 21 días`; sin API, la tarjeta dice "Sin datos".
- Fuera el eyebrow del flujo (`product-flow-shell` + 5 llamadas): dos eran el pill con `·` prohibido.
- Auth: "Inicia sesión", "Cuentas de ejemplo", sin eyebrow, copy corregido.
- Inglés fuera del copy español (`timeline`, `SLA`, `workflow`, `zoom`, `preview`, `Push notifications`, `Offline`, `Canvas`).
- `index.html` sin em-dash ni "100% virtuales".

**Demo:** `/cuestionario` (paso 1, revisión y resultado) y `/productos/traslado360/cuestionario`. Verificación: `bun run build:frontend` y `bun run test:frontend` (111 specs).

**Pendiente:** unificar los 4 mapas de estado, borrar los 9 componentes muertos y su CSS, y los tells de CSS restantes (header con blur, confeti violeta, `border-left` de acento). Ver `docs/NO_SLOP.md`.

### 2026-09-15 — Marketing sin AI slop (landings + cuestionario)
Erradicación de los patrones que `AGENTS.md` §2 prohíbe en la superficie de marketing, más el copy inflado.

**Fuera del producto**
- `LandingStatisticsComponent` eliminado (tira de 3 métricas sintéticas) y el campo `stats` del modelo de producto. La escena `#evidencia` de Divorcio360 ahora deriva del `workflow` y del `price` reales.
- Checkmarks de garantías fuera del catálogo y de los planes de licencia; `.lp-plan li::before` y `.lp-list-check` borrados.
- Testimonios fabricados ('Ana R.', 'María V.', 'Bufete Ruiz', 'Vega & Asociados') eliminados junto con el campo `testimonials`.
- Headers con código falso: `#LS-2026-0842` y `ACT-2026-170130-00412` (station preview), `Expediente LS-014` y `Estado 04 · minuta lista` (demo case window).
- Eyebrows y kickers fuera (`.section-kicker`, `.lp-eyebrow`, `.lp-cta-eyebrow`, `.cine-kicker` de escena). El pill `Un solo pago · sin cuotas mensuales` eliminado.
- Los 5 SVG de `demo-scenes` ya no rotulan "DEMO" (cierra el intento del 2026-09-13, que solo cubrió el mock del home): `DOCUMENTO FICTICIO`, `DE EJEMPLO`, `Firmante A/B`, `Expediente de ejemplo`.
- Métrica inventada `~14 días resolución` y `Plazo estimado · 14 días` eliminadas. Campos muertos de la landing borrados (`featuredProduct`, `sidePlans`, `enterprise`, `LEGALSTATION_ENTERPRISE`, inputs sin uso del hero).

**Copy**
- H1 a 3–5 palabras: `Divorcio por mutuo acuerdo.`, `Traslado vehicular sin filas.`, `Traslado de inmueble sin gravámenes.`
- Em-dash retórico fuera del copy corto (ledes, `pq-price`, barras de mock, opciones de cuestionario, placeholders de revisión).
- Slogan canónico sin la tautología "sin filas ni trámites" ni "al mismo costo", que el propio test veta.
- "inteligente" y "en vivo" fuera del catálogo; `alt` de galería sin "DEMO"; garantías genéricas reescritas (`SLA 99.9% y soporte 24/7` → acompañamiento en la puesta en marcha).

**Guards**
- `product-sites.data.spec.ts`: el guard de copy ahora recorre los 7 productos y el catálogo, y suma `—`, `inteligente`, `en vivo`, `\bSLA\b`, `kanban`, `\bsync\b`.
- Nuevo `slop-guard.spec.ts`: renderiza las 4 landings y asserta ausencia de kickers, checks de garantía, códigos de expediente y em-dash.

**Demo:** guest en `/`, `/productos/divorcio360`, `/productos/traslado360` y `/productos/bienraiz360`. Verificación: `bun run test:frontend` (111 specs) y `bun run build:frontend`.

**Pendiente (fuera de este slice):** overflow horizontal por debajo de ~400px, preexistente y visible también en `/auth`. Restan en auth (`ACCESO RÁPIDO (DEMO)`, `Bienvenido de nuevo`), checkout/upload (em-dash), `client-panel` ("timeline"), `STAGE_HINT`/`STAGE_SHORT` duplicados, header con blur y 5 componentes muertos.

### 2026-09-14 — Expediente abogado dossier denso
`abogado@demo.ec` → Bandeja → expediente en revisión (ej. `#4`). Cabecera sin caja (H1 Fraunces + badge + progreso compacto + regla teal). Pendientes y «Próxima acción» en el rail derecho. Un solo panel por tab (Resumen/Documentos/Minuta/Firmas/Historial).

### 2026-09-14 — Precios toggle Servicios/Licencia
`/` → `#precios`. Toggle **Servicios** / **Licenciamiento**. Servicios muestra honorarios únicos (Divorcio360 $349, Traslado360 $199, BienRaiz360 $299). Licenciamiento mantiene Starter/Professional/Enterprise.

### 2026-09-14 — Bandeja búsqueda + filtros
`abogado@demo.ec` → `/abogado`. Sin lanes: listado completo con búsqueda (nombre o #), filtros Servicio y Estado (Revisión por defecto). Más de 10 resultados → paginación.

### 2026-09-14 — Masthead folio /abogado
Login `abogado@demo.ec` → `/abogado`. Cada módulo (Bandeja, Servicios, Resumen, Modelos, Revisión, Licencia) comparte el mismo masthead: H1 Fraunces denso, aside operativo (no eslogan) y regla con tick teal. Cambiar de módulo y ver que el aside y las acciones cambian; el tick teal se mantiene.

### 2026-09-13 — Branding flujo multi-producto
Desde `/cliente` (Todos), abrir un expediente Traslado360 en Documentos: la cabecera muestra **Traslado360 por LegalStation** (no Divorcio360). Migas: Mis trámites → Traslado360 → Documentos. Mismo sync en checkout, firma, consulta y expediente.

### 2026-09-13 — Divorcio360 timeline in-panel
`/cliente` → servicio Divorcio360: el sidebar desglosa Pago → Documentos → Consulta → Firma → Notaría. Cada paso cambia solo el content (mismo layout dossier). Un expediente activo (mutuo acuerdo).

### 2026-09-13 — Traslado360 timeline in-panel
Mismo patrón que Divorcio360: sidebar con pasos; documentos de matrícula + acuerdo; sin salir de `/cliente`.

### 2026-09-13 — Header LegalStation estable
Cabecera siempre **LegalStation** (logo), misma tira de nav en todos los productos. Ya no salta a “Traslado360 por LegalStation”.

### 2026-09-14 — Editor servicios grafo
`abogado@demo.ec` → Servicios: lienzo n8n. El **+** expande a «Nueva pregunta» y **No aplica** (mensaje + costo de asesoría configurable). Seed Divorcio360 con salidas No aplica / evaluación. Recarga Servicios para refrescar el seed.

### 2026-08-29 — Bootstrap
Repo en `chamba/divorcio360`, reglas Cursor, docs de alcance, Go API + Angular scaffold.

### 2026-08-29 — Auth + seed
JWT login/register. Seed: cliente con caso en estado 03; abogado listo.

### 2026-08-29 — Cuestionario
POST `/api/v1/questionnaire` + UI condicional. CTA sin WhatsApp.

### 2026-08-29 — Pago + docs + firma
Checkout Payphone mock, upload multipart, canvas firma con evidencia IP.

### 2026-08-29 — Paneles + Fase 2
Cliente/abogado/expediente. Mocks: admin, plantillas, IA, SATJE, B2B, móvil.

### 2026-08-29 — Panel abogado funcional
Workspace abogado con revisión docs (aprobar/rechazar), generación minuta HTML mock, acciones por estado con gates (no advance genérico). Bandeja con filtros. Cuestionario persistido en caso. Seed caso #1 con docs placeholder.

**Demo abogado:** login abogado → Revisión → caso #1 → aprobar cédula+partida → preparar minuta → enviar firma → (cliente firma) → confirmar → notaría hasta 10.

**Reset seed:** borrar `backend/data/divorcio360.db` y reiniciar API.

### 2026-08-29 — Fase 2 pulida + UX por rol
- **Rol abogado:** nav sin “Cuestionario”; landing con CTAs operador; guard `clienteOrGuestGuard` bloquea abogado en `/cuestionario`; APIs `/mock/*` solo abogado.
- **Fase 2:** shell con sidebar (`/fase2/*`), admin con KPIs + embudo + tablas, plantillas con preview modal, IA con selector de caso + cross-check + chat, SATJE con registros + matches, B2B con tenant + facturas, móvil con roadmap PWA vs nativa.
- **Panel abogado:** sub-layout sidebar (Bandeja | Fase 2), stats, tabla con pipeline 01–10, workspace con tabs + header progreso.
- **Cuestionario:** wizard con grupos, resumen pre-envío, resultado con iconografía y copy bufete.
- **Shared:** `MetricCard`, `StatusBadge`, `ProgressSteps`, `DataTable`, `MockBadge`.

**Demo 8 min:**
1. Login `abogado@demo.ec` → confirmar nav sin cuestionario → bandeja con stats/tabla → caso #1 tabs.
2. Fase 2: Admin (embudo) → IA (caso #1) → SATJE sync → B2B.
3. Logout → login `cliente@demo.ec` → cuestionario rediseñado → flujo verde.

### 2026-08-29 — LegalStation SaaS + demo legal-tech funcional
- **Marca:** UI pública **LegalStation** (SaaS multi-producto); **Divorcio360** único flujo live; 5 productos fake con badge “Próximamente”.
- **Rutas:** `/` catálogo SaaS → `/productos/divorcio360` → cuestionario; tokens US legal-tech (`saas-tokens.scss`).
- **Abogado:** `revert_step` (04→03 … 10→09) + `ConfirmDialog` en avance, retroceso, docs, minuta; campana notificaciones en shell.
- **Cliente:** mensajes visibles (`case_notes.visible_to_client`); sección “Mensajes de LegalStation” en expediente; LOPDP checkbox en registro.
- **SLA:** `days_in_status` + badge en bandeja abogado.
- **Fase 2 persist:** métricas híbridas; SATJE vincular persiste + badge workspace; B2B PATCH plan; plantillas master PATCH.
- **Schema:** `notifications`, `mock_satje_links`, `mock_tenant`, `mock_master_template_edits`, `users.lopdp_consent_at`.

**Demo 10 min:**
1. `/` LegalStation — catálogo (Divorcio360 live vs fake “Notify me”).
2. Divorcio360 → cuestionario → registro con LOPDP → flujo cliente (pago, docs, firma).
3. Abogado: bandeja SLA → caso #1 → confirmaciones + revert → campana notificaciones → SATJE badge si vinculado.
4. Fase 2: Admin (embudo híbrido, editar plantilla) → SATJE sync + Vincular → B2B upgrade plan.
5. Cliente: expediente → “Mensajes de LegalStation”.

**Reset DB:** borrar `backend/data/divorcio360.db` y reiniciar API tras cambios de schema.

### 2026-08-29 — Auth LegalStation + UI Divorcio360 (hero roadmap, galería, stats)
- Login/registro en `/auth?returnUrl=/` con header LegalStation (sesión compartida JWT).
- Divorcio360: hero roadmap (hero-section-5), galería elástica, statistics cards; auth contextual solo post-cuestionario.
- Cómo demo: LegalStation → Ingresar (cliente@demo.ec / demo1234) → volver a `/` logueado → Divorcio360 → mismo login.
- Regla: `.cursor/rules/frontend-design-angular.mdc`.

### 2026-08-30 — Demo audio (por uso, 3 roles, productos lite, UI unificada)
- **Pricing story:** LegalStation `#precios` = licencia bufete ($/mes); Divorcio360 = honorario único sin suscripción.
- **B2B:** `/fase2/billing` — link cliente, comisión 15% demo, plan con nombre humano.
- **Productos live:** Traslado360 (`/productos/traslado360` → `/intake/traslado360`) y BienRaiz360 — pago único mock.
- **Rol notario:** `notario@demo.ec` → `/notario` — aprueba docs, comparecencia, acta.
- **Cliente:** agendar reunión notarial en expediente; checkout con recibo; upload dropzone; firma con preview minuta.
- **UI:** `ProductFlowShell` + `product-flow.scss` — mismo look landing → flujo demo.

**Demo 12 min:**
1. `/` LegalStation — licencia bufete (no suscripción cliente) → catálogo con 3 productos live.
2. Divorcio360 → cuestionario → pago único → docs → firma → agendar notaría.
3. Abogado → caso #1 → minuta/firma → Fase 2 billing (link + comisión).
4. Notario → bandeja → aprobar/comparecencia/acta.
5. Traslado360 lite — intake → pago → docs.

**Reset DB:** borrar `backend/data/divorcio360.db` y reiniciar API (migración rol `notario`).

### 2026-08-30 — Audio gaps: slogan, sitios producto completos, reuniones virtuales
- **Slogan canónico:** *Servicios jurídicos al mismo costo, sin filas ni trámites* — LegalStation hero, Divorcio360 hero band, shell footer, flujos producto.
- **Membresía:** cliente = pago único por trámite; bufete = licencia mensual en `#precios` LegalStation y Fase 2 B2B.
- **Reuniones mock:** `/consulta/:caseId` (abogado) y `/reunion-notarial/:caseId` (notario) — videollamada simulada + chat; CTAs en expediente, upload y post-firma.
- **Traslado360 / BienRaiz360 sitios completos:** `/productos/{slug}` marketing (hero mock UI, timeline, stats, galería, precios) → `/productos/{slug}/cuestionario` (wizard 5–8 preguntas + sidebar expediente) → checkout → docs → consulta → firma → notaría.
- **Plataforma UI:** `ProductSiteShell`, `product-sites.data.ts`, `ProductLandingComponent`, `ProductQuestionnaireComponent`; rutas `/intake/*` redirigen a cuestionario.
- **Backend:** `consultation_at` + `POST /cases/{id}/consultation`; doc types `matricula`/`titulo`/`acuerdo` por producto.

**Demo 15 min:**
1. `/` — slogan completo + licencia bufete vs pago único cliente.
2. **Traslado360** sitio completo → cuestionario → registro → pago $199 → docs → consulta virtual → firma → agendar/entrar reunión notarial.
3. **Divorcio360** — mismo flujo con consulta + notaría visible en expediente.
4. Abogado + notario en paralelo (caso seed / nuevo caso producto).

**Reset DB:** borrar `backend/data/divorcio360.db` y reiniciar API (columna `consultation_at`).

### 2026-08-30 — Firma virtual + panel operador (bugs demo)
- **`notify_client_sign`:** «Notificar al cliente» — solo aviso, **no cambia estado** (sigue en 04).
- **`confirm_signature`:** solo en **05** y solo si hay fila en `signatures` — revisar tab Firmas antes de confirmar.
- **Cliente autónomo:** flags API `can_sign`, `has_minuta`, `has_signature`, `sign_hint`; CTAs en `/cliente`, expediente, upload, firma.
- **Al firmar:** reemplaza firma anterior (mock); avanza caso a **05**.
- **Fix pantalla blanca abogado:** `blockers: null` en JSON → normalizar arrays + loading/error en `lawyer-case`.
- **Productos:** gates abogado por `matricula`/`acuerdo`/`titulo`; minuta `Minuta_{Producto}_CasoN.html`.

**Demo firma (5 min):**
1. Abogado genera minuta → estado 04.
2. Cliente firma solo desde `/cliente` (sin notificación).
3. Abogado ve estado 05 + imagen en Firmas → confirmar → notaría virtual.

Ver **`docs/HANDOFF.md` → Errores que NO repetir**.

### 2026-08-30 — Flujo documental multi-producto alineado
- **`internal/products`:** fuente única de docs requeridos (divorcio360 / traslado360 / bienraiz360).
- **Blockers por etapa:** estado 03 = solo docs; 04 = minuta; 05 = firma; sin mezclar pendientes futuros.
- **Gates:** `GenerateMinuta` y firma cliente exigen docs aprobados; no saltar revisión.
- **Producto en casos:** `ResolveProduct` desde body o `questionnaire.product`; auth pasa `product` al crear caso.
- **Workspace abogado:** `required_docs`, `stage_hint`, panel «Pendientes en esta etapa».
- **Demo Traslado360 (carro):** `/productos/traslado360/cuestionario` → pago $199 → upload matrícula + acuerdo → abogado `/abogado/caso/:id` aprueba → minuta → cliente firma → confirmar.
- **Reset DB:** borrar `backend/data/divorcio360.db` y reiniciar API (seed caso #1 divorcio en 03).
- **Verificación:** `backend/scripts/verify-flow.ps1` con API en `:8080`.

### 2026-08-30 — Flujo realista + UX español
- **Notificaciones:** `POST /notifications/read-all` + botón «Marcar todas como leídas» en campana del shell.
- **Abogado docs:** ver antes de aprobar (UI); sin acción bulk `approve_and_prepare`; auto **03→04** al aprobar último doc.
- **Minuta:** abogado sube PDF del notario (`POST /cases/{id}/minuta/upload`) → `case_outputs`; ya no HTML mock.
- **Firma cliente:** multipart documento (PDF/imagen), no canvas; tab Firmas abogado muestra enlace si es PDF.
- **Divorcio360 landing:** scroll a `(0,0)` al entrar + `ScrollTrigger.refresh()`.
- **Español:** copy visible (demostración, Cola de casos, por LegalStation, etc.).

**Demo abogado (5 min):**
1. `/abogado/caso/1` → tab Documentos: **Ver** cada doc → **Aprobar** (expediente pasa a 04 solo).
2. Tab Minuta → subir PDF del notario.
3. Cliente en `/firma/1` → sube documento firmado.
4. Abogado tab Firmas → «Confirmar firma recibida» → notaría virtual.

**Demo notificaciones:** campana → «Marcar todas como leídas».

**Verificación:** `backend/scripts/verify-flow.ps1`.

### 2026-08-31 — UX LegalStation: header, documentos, reuniones, Fase 2
- **Header:** «Evaluar mi caso» y «Mis expedientes» (logueado) siempre visibles; selector de productos alineado con la nav.
- **Landing `/`:** carrusel manual (sin auto-play); dots clicables.
- **Upload:** badge con más aire; botón rojo «Eliminar archivo» junto a «Ver» (`DELETE /cases/{id}/documents/{docId}`).
- **Reuniones:** solo agendar fecha/hora (días pasados bloqueados); popup «Su fecha se registró, espere el link…»; sin «Unirse a consulta virtual».
- **Cuestionario no_aplica:** bloque de agendamiento inline; login preserva `returnUrl=/cuestionario?resume=result`.
- **Fase 2:** nav en lenguaje llano; Admin/Plantillas/IA/SATJE ocultos para notario; copy minuta/acta: notaría envía → abogado sube.

**Demo cliente (5 min):**
1. `/` → header: Productos, Evaluar mi caso; login → «Mis expedientes» visible en cualquier página.
2. `/cuestionario` → respuestas → **no_aplica** → agendar reunión (si no hay sesión: login → vuelve al resultado).
3. Caso con docs → `/upload/{id}` → Eliminar archivo → resubir.
4. Expediente → agendar consulta/notaría → popup de confirmación.

**Demo abogado Fase 2:** `/fase2/admin` — menú lateral con descripciones claras; minuta en workspace explica flujo notaría→abogado.

### 2026-08-31 — Fase 2 comercial + agendamiento + pagos premium
- **Agendamiento:** popup funcional (z-index 10000); tarjeta persistente «Cita agendada»; persistencia sessionStorage; flujo auth con `d360_pending_meeting`; visible en cuestionario no_aplica y Mis expedientes.
- **Notaría eliminada:** ruta `/notario`, `/reunion-notarial`, login demo notaría, guards y nav; reunión notarial virtual removida del expediente cliente.
- **Checkout:** animación tarjeta procesando + factura generándose (CSS puro).
- **Dashboard bufete:** grid hero (ingresos + casos activos destacados), embudo, ingresos por producto, CTA «Ir a mis casos».
- **Plantillas:** variables `{{}}` → chips legibles («Nombre del cliente», etc.).
- **Notificaciones:** fix escalera (block layout); leídas vs no leídas con opacidad.
- **SATJE:** lenguaje legal natural («Sincronizar expediente judicial»).

**Demo agendamiento:** `/cuestionario` → no_aplica → confirmar → popup → tarjeta verde; `/cliente` muestra la misma cita.
**Demo pago:** `/checkout/{id}` → animación tarjeta → factura → subir documentos.

### 2026-08-31 — Pulido producción: acciones, notificaciones, copy
- **Acciones expediente:** botones centrados; acción única = CTA grande con color del producto (`--lp-accent`); todas las acciones son botones visibles.
- **Notificaciones:** layout flex robusto, sin alturas fijas; fechas ISO formateadas; textos con `break-words`.
- **Copy:** eliminado "demo/demostración" de checkout, footer, Fase 2, intake y flujos de producto.

**Demo acciones:** `/caso/{id}` — solo "Subir documentos" aparece como botón sólido centrado.
**Demo notificaciones:** campana → textos alineados, fechas legibles.
- **Citas (fix crítico):** `MeetingScheduler` autónomo con `[saveFn]`; modal en `document.body`; funciona en cuestionario no_aplica, expediente y Mis expedientes.
- **Notificaciones:** más padding/gap; solo no leídas; clic individual las quita; «Marcar todas» cierra el panel; copy sin referencias a notaría.
- **Checkout 2 columnas:** formulario izquierda; resumen del pedido derecha; post-pago → `AnimatedTicket` (recibo con confetti).
- **Fase 2 minimal:** Admin, SATJE, Plantillas y Asistente sin párrafos explicativos — solo títulos, métricas y acciones.

**Demo citas:** `/cuestionario` → no_aplica → «Confirmar reunión con abogado» → popup; `/cliente` → agendar si no hay cita.
**Demo pago:** `/checkout/{id}` → pagar → overlay oscuro → loader centrado → recibo en modal → «Subir mis documentos».
**Demo notificaciones:** campana → leer una (desaparece) o «Marcar todas» (panel se cierra).
**Demo Fase 2:** `/fase2/admin` — escaneable en 2 s, sin bloques de texto.

### 2026-08-31 — AdvancedStats dashboard Fase 2
- **Resumen del bufete** reemplazado por dashboard visual: gráfico de área animado, KPIs del bufete, tarjeta de objetivo y crecimiento de clientes.
- Datos conectados a `/mock/admin/metrics` (ingresos, casos activos, tiempo de resolución, tasa de finalización).
- Animaciones de entrada escalonadas al scroll (sin dependencias React).

**Demo:** login abogado → Fase 2 → Resumen del bufete → gráfico + 4 KPIs + progreso trámites digitales.

### 2026-09-02 — Cuestionario UX progreso lateral
- **Barra de progreso estática:** vuelve arriba del formulario (flujo normal, no fija al viewport); no se mueve ni se acorta al animar la card.
- **Animación de preguntas:** cada tarjeta entra desde abajo; al retroceder, desde arriba.
- **Slot fijo:** `ob-card-slot` con altura mínima para que el layout no salte entre preguntas.
- Mismo patrón en cuestionarios de otros productos (`product-questionnaire`).

**Demo:** `/cuestionario` → responder Sí/No; la barra superior permanece quieta mientras la pregunta sube desde abajo.

### 2026-09-02 — Cuestionario pantalla completa
- **Sin footer** en rutas de flujo Divorcio360 (`/cuestionario`, checkout, cliente, etc.).
- **Formulario arriba** bajo el header, sin pie de página.

**Demo:** `/cuestionario` → header + formulario alineado arriba, sin footer.

### 2026-09-02 — Ubicación con selects
- **País, provincia y ciudad** como tres `<select>` en el último paso del cuestionario (Ecuador + países frecuentes).
- Texto actualizado sin referencia a notaría cercana.

**Demo:** `/cuestionario` → último paso → elegir país, provincia y ciudad.

### 2026-09-02 — Checkout carrito desglosado
- **Resumen tipo carrito:** valor del trámite + valor del notario ($20 ref.) + extras según cuestionario (hijos, bienes, exterior, etc.) marcados como «Incluido».

**Demo:** `/checkout/{id}` → ver líneas del carrito y total según respuestas del cuestionario.

### 2026-09-02 — Consulta virtual tipo upload
- **Layout** igual que subir documentos: sidebar de progreso + tarjeta principal.
- **Solicitar consulta** sin elegir fecha; el abogado coordina después.

**Demo:** `/upload/{id}` → documentos → «Solicitar consulta» → botón en zona de carga.

### 2026-09-02 — Panel cliente general
- **Sin agendar consulta** en `/cliente` — la consulta se solicita desde cada expediente.
- **Tu cuenta:** expedientes por producto + facturas (pagos) en un panel unificado.

**Demo:** login cliente → `/cliente` → expedientes y facturas de todos los productos.

### 2026-09-03 — Marketing UI polish (Fase 0 + 1)
- **Tipografía:** Fraunces display + Inter 400–800, scoped a `.landing-page`.
- **Teal AA:** `--lp-accent-ink: #2e6e67` en Divorcio360; 6 pasos en grid `auto-fit`; mock UI de expediente (sin Unsplash).
- **Pricing:** “Sin costo” en Derivación; CTA primary vs tertiary; values asimétricos 1.4fr / 1fr.

**Demo:** `ng serve` → `/productos/divorcio360` (hero pin + mock + 6 pasos + precios). Spot `/` y `/productos/traslado360`.

### 2026-09-03 — Marketing UI polish (Fase 2)
- **Home accent:** `/` hereda `--primary` teal `#2f6f68`. Sin override índigo `#4455c4`.
- **Catálogo:** badges En vivo / Próximamente. Copy: Divorcio360, Traslado360 y BienRaiz360 en vivo.
- **CTA bottom:** teal compartido (sin gradiente índigo).
- **Dots:** pill activo en `landing-shared.scss`; hit-area 2.25rem.

**Demo:** `ng serve` → `/` — hero collage = 3 productos live; `#catalogo` badges; `#precios` lift hover; CTA final teal no índigo. Spot `/productos/divorcio360` (teal producto `#4a9e96` intacto).

### 2026-09-06 — Divorcio360 landing UI/UX
Superseded by “Divorcio360 no-slop repair”; do not use this section as the current walkthrough.
- **Hero:** pin revela mock del expediente (sin video Cloudinary roto). Intro ~70svh, sin outro, reveal de palabras one-shot.
- **CTAs:** cliente logueado ve “Ir a mi expediente”; operador ve el panel. Sin self-link “Volver a Divorcio360”.
- **Layout:** 6 pasos 3×2 con conectores; valores en fila editorial; stats en banda; logos en marquee.

**Demo:** `/productos/divorcio360` — scroll corto hasta el mock; logueado como Carlos: CTAs de expediente; invitados: “Evaluar mi caso”.

### 2026-09-06 — Divorcio360 no-slop repair
- Hero con un H1, contraste AA y CTA visible sin scroll.
- Una sola demo del expediente; sin marquee ni prueba social ficticia.
- Navegación coherente para invitado, cliente y abogado.
- Motion local a su componente y fallback completo para reduced motion.
- Política de datos, términos demo y footer `Hecho por CodiDevs`.

**Demo:** `/productos/divorcio360` como guest → cliente → abogado; revisar móvil 390px y reduced motion.

### 2026-09-06 — Cuestionario no-slop
- Sin `app-ob-atmosphere` (wash, papel, sellos, watermark).
- Progreso en segmentos `--primary`, radio 2px, hover de color.
- Header de flujo sólido (sin blur). Card `--radius-md`. H1 Inter.
- Resultado con Atrás a la revisión.

**Demo:** `/cuestionario` green path → review → Apto → Atrás. Spot 390px.

### 2026-09-08 — Home `/` no-slop
- Un hero (una imagen, sin collage ni KPIs). CTA: guest `#catalogo`, cliente `/cliente`, abogado `/abogado`.
- Hero editorial: Fraunces grande, bezel, wipe `clip-path` + drift lento (pausa en hover). CTA con chip y `:active` scale. Catálogo bento. Grain.
- Catálogo y pasos: stagger `--i` * 50ms solo si entran desde abajo. Secciones visibles sin JS. `prefers-reduced-motion` apaga wipe/drift/stagger.
- Un catálogo: 3 live + lista próximamente. Sin trust bar, carousel, stats grid ni galería elástica.
- Pricing: un plan featured. Footer `Hecho por CodiDevs`.

**Demo:** `/` como Carlos → Mis expedientes → `/cliente`. Guest: Ver qué puedo tramitar → `#catalogo`. Spot `/productos/divorcio360` (pin + band) y `/productos/traslado360` (gallery).

### 2026-09-08 — Fase 2 admin no-slop
- `/abogado/fase2/admin` como abogado: sidebar sólido 248px, nav por etiqueta, sin card dashed.
- Resumen: `<dl>` de conteos live + ingreso/tiempo de referencia. Tabla de `recent_cases` con Abrir → `/abogado/caso/:id`.
- Sin KPI grid, eyebrows, % inventados ni fade `opacity: 0`. Loading/error/retry.

**Demo:** `abogado@demo.ec` / `demo1234` → Fase 2 → Resumen. Abrir un caso. Spot `/abogado/fase2/templates` (chrome compartido).

### 2026-09-10 — Frontend audit polish (diseño)
**Corregido**
- Copy visible “demo / demostración / Vista previa / Cliente demo” fuera de landings, product sites, SaaS home y badge Fase 2 (legales CodiDevs se mantienen).
- Sidebar persistente: `/abogado` + `/abogado/fase2/*` en un solo shell (Casos + Herramientas). Redirects `/fase2/*` → `/abogado/fase2/*`. Aside no remonta; fade corto solo en main.
- Traslado360 / BienRaiz360: pricing 2 columnas + CTAs alineados; stats 2×2 cuando hay 4 métricas.
- Divorcio360: composición editorial (marca + promesa corta + una CTA + mock expediente); secciones sistema / flujo / prueba / precio.

**Siguiente (fuera de este slice)**
- Panel cliente: densidad y jerarquía.
- Checkout: alineación del carro.
- Páginas de contenido Fase 2: polish interno (admin/templates/AI) más allá del chrome.

**Demo:** `/productos/traslado360#precios` y `/productos/bienraiz360` (simetría). `/productos/divorcio360` guest. Login `abogado@demo.ec` → Bandeja ↔ Resumen del bufete sin salto de menú.

### 2026-09-10 — LegalStation landing premium
- Hero brand-first: video local `/videos/legalstation-hero.mp4` + overlay + mark SVG + slogan exacto; CTA por rol.
- Fallback poster + `prefers-reduced-motion` sin autoplay.
- Secciones con container 1200px, ritmo vertical, cards producto 3-up alineadas, pasos y enterprise limpios.
- Header marketing alineado al mismo container; mark SVG compartido.

**Demo:** `/` guest → Ver qué puedo tramitar → `#catalogo`. Spot 375px (sin overflow-x). Reduced motion: poster estático.

### 2026-09-10 — Landing layout polish
- Causa hueco derecho: pricing 1-col estrecha → grid 3 planes (Starter / Professional / Enterprise).
- Cards: `--shadow-md` + hover `translateY(-3px)` / `--shadow-lg` (landing only; reduced-motion sin transform).
- Secciones: base `--bg` vs soft `--bg-muted` para contraste sutil.
- Header: `a.btn` ya no hereda underline ni `a:hover` verde-sobre-verde; Ingresar ghost + Evaluar primary legible.

**Demo:** `/` guest → hover “Evaluar mi caso” (texto blanco). Scroll `#precios` — tres cards. Spot 1440 y 375.

### 2026-09-10 — Cards shine / tilt / FAQ
- Eliminada `#sistema` (redundante con `#flujo`).
- Productos live: tilt 3D sutil (desktop fine pointer; off en touch / reduced-motion).
- Pricing: Professional con shine border teal + badge “Más popular”.
- `#faq` tras precios: marquee desktop / accordion móvil; copy alineado al demo.
- Variedad: flujo tipográfico, enterprise outline, sin deps nuevas.

**Demo:** `/` guest → hover productos → `#precios` (brillo en Professional) → `#faq`. Spot 375 (accordion + pricing 1-col).

### 2026-09-10 — Expediente CaseProgress (ES)
- Componente reutilizable `app-case-progress`: recorrido marketing + línea de estados del expediente (10 estados API, labels sin tocar backend).
- Home `/#flujo`: “De la recepción a la finalización” (Recepción → Expediente digital → Revisión → Firma → Finalización); sin “Intake/Cierre” en UI.
- Expediente `/caso/:id`: misma UI para Divorcio360 / Traslado360 / BienRaiz360; checks, etapa activa, próximos atenuados, línea animada, `prefers-reduced-motion`.
- Sitios producto `#flujo` (Traslado/BienRaiz) reutilizan el mismo componente.

**Demo:** `/` → `#flujo` (clic etapas). Login `cliente@demo.ec` → expediente → Línea de estados. Spot móvil: recorrido vertical.

### 2026-09-10 — CaseProgress sin overlap + Auth system
- Recorrido: rail + labels; descripción única en panel inferior (horizontal); vertical ≤960px; animación línea → detalle.
- Auth workspace: canvas `--bg` + **dos cartas** (form | foto) con gap fino y margen chico; cada una con borde/`radius-xl`; móvil form-only. Forgot demo sin API.

**Demo:** `/#flujo` desktop sin textos solapados. `/auth` → margen de fondo alrededor del shell grande + mitad visual.

### 2026-09-10 — Plantillas Fase 2 editables
- `Duplicar plantilla` clona de verdad (SQLite). Editor: nombre, categoría, estado, versión, campos, HTML.
- Originales se editan; solo las copias se borran. Refresh conserva cambios. No engancha la minuta live del expediente.

**Demo:** `abogado@demo.ec` / `demo1234` → Fase 2 → Modelos de documentos → Duplicar → cambiar nombre y un párrafo → Guardar → F5. Borrar la copia. Original sigue.

### 2026-09-10 — Cinemática LegalStation (A) + motion always-on
- Demo **nunca** respeta `prefers-reduced-motion` (Windows “reducir animaciones” ya no congela el UI).
- Fuera el clay neo de `/cuestionario`. Un idioma: cream + Fraunces + teal en cuestionario, checkout, upload y firma.
- Pregunta entra con blur/translate; Sí/No se desplaza; progreso llena con `scaleX`.
- Home: Divorcio360 héroe; Traslado/BienRaiz recortes.

**Demo:** `/` → héroe Divorcio → `/cuestionario` Sí/No (card entra) → checkout. Spot `/productos/traslado360` cuestionario. GSAP pin en `/productos/divorcio360`.

### 2026-09-10 — Bandeja abogado como cola de trabajo
- `/abogado` deja la tabla 01–10. Carriles: Te toca / SLA / etapa. Cada fila dice la acción, no el código.
- Default: casos que esperan al abogado. SLA primero. Enter stagger + hover translateX.
- Sin `prefers-reduced-motion`.

**Demo:** `abogado@demo.ec` / `demo1234` → Bandeja. Carril **Te toca** vs **Todos**. Abrir un caso. Hover fila.

### 2026-09-10 — Sidebar abogado a rail fijo
- `/abogado` deja la columna-tarjeta dentro de `.shell`. Rail 248px sticky, borde derecho, full height bajo el header.
- Activo: inset teal. Móvil: barra superior wrap.

**Demo:** `abogado@demo.ec` → Bandeja y Resumen. El menú pega a la izquierda y no se encoge.

### 2026-09-10 — Panel cliente como cola de trámites
- `/cliente` deja el 2-col Expedientes + Facturas (mismo caso dos veces).
- Carriles Te toca / En curso / Cerrados. Fila dice la acción; clic va a pagar, subir, firmar o expediente.
- Enter stagger + hover translateX. Sin `prefers-reduced-motion`.

**Demo:** `cliente@demo.ec` / `demo1234` → Tu cuenta. **Te toca** vs **Todos**. Clic **Subir** o **Abrir**.

### 2026-09-10 — Filtro por tipo de trámite (cliente)
- `/cliente` chips de producto si hay más de un tipo (Divorcio360, Traslado360, …).
- Carril + producto se combinan. Contadores se recortan entre sí.

**Demo:** `cliente@demo.ec` → chip **Traslado360** vs **Divorcio360**.

### 2026-09-10 — CRUD completo de plantillas
- `/abogado/fase2/templates`: **Nueva plantilla** (POST), duplicar, editar, borrar copias/creadas.
- Originales seed no se borran (409). Refresh conserva.

**Demo:** `abogado@demo.ec` → Modelos de documentos → Nueva plantilla → Crear → F5 → Borrar.

### 2026-09-10 — Asistente de revisión (escritorio)
- `/abogado/fase2/ai`: select de expediente + ficha corta (resumen, riesgo, siguiente) + chat mock.
- Chips: qué sigue / menores / minuta. `POST /mock/ai/chat`.

**Demo:** `abogado@demo.ec` → Asistente de revisión. Cambia a #1. Chip **¿Listo para minuta?** y escribe otra pregunta.

### 2026-09-10 — Link de cliente LegalStation
- `/abogado/fase2/billing`: enlace mock `legalstation.ec/divorcio360/r/dra-ana-ruiz`, no localhost.
- Copiar + clic abre el producto local.

**Demo:** `abogado@demo.ec` → Facturación B2B. Copiar. Clic el link.

### 2026-09-11 — Demo cliente máximo movimiento
Recorrido comercial 16:9: home con video/fallback, Divorcio360 con pin circular y capítulos, cuestionario rápido, checkout con overlay, upload con `scaleX(--p)`, firma con evidencia.

**Demo:** invitado en `/` → Abrir Divorcio360 → Evaluar mi caso → pagar → documentos → firma. Zoom 125% en 1280×720. `/abogado` no cambia de idioma visual.

### 2026-09-11 — Recorrido cinematográfico Expediente vivo
Cliente path como película: home tráiler (video + wordmark + dossier), Divorcio360 pin 260vh + 4 escenas, cuestionario monumental, checkout bóveda (notaría *Se paga por separado*), mesa de upload, firma con sello full-screen.

**Credenciales:** `cliente@demo.ec` / `demo1234`.

**Walkthrough 8 min**
1. `bun run reset-db` + `bun run dev`.
2. `/` → CTA **Abrir Divorcio360** (cortina de hoja).
3. `/productos/divorcio360` — pin: círculo teal abre expediente. Scroll atrás reproduce etapas.
4. **Evaluar mi caso** → `/cuestionario` (o login si pide cuenta).
5. Pago `$349` — gastos notariales aparte. Overlay + ticket.
6. Upload cédula/partida.
7. Firma: expediente seed `can_sign` (status 04, minuta lista). `/firma/:id` → sello DEMO.

**Fixture firma:** segundo caso cliente con docs aprobados + minuta real (`backend/demo-fixtures`). No falsea gates. Firma fail-closed: snapshot `getCase` + outputs + firmas.

**No tocar:** `/abogado` y `/abogado/fase2/admin`.

### 2026-09-11 — Cierre P1/P2 recorrido cinematic
SVG demo UTF-8. Firma no abre sin minuta. Overlay checkout atrapa Shift+Tab. Cortina siempre montada (abogado→home sí, abogado↔fase2 no). Cuestionario `ob-sheet`. Upload hojas 52vh. Pin usa `ScrollSceneDirective`. Seed copia PDFs o falla.

**Demo:** `bun run reset-db` + `bun run dev`. Login cliente. Caso 04 → `/firma/:id` bloqueado hasta minuta. `/abogado` sin View Transitions.

### 2026-09-13 — Client journey handoff fixes
Cierre del flujo cliente multi-producto: guest cuestionario de producto siembra `d360_q_result`, auth conserva `next=checkout`, unpaid no dead-end en `/caso`, login CTA en review, error visible si `createCase` falla post-auth, Mis expedientes scoped por producto, booleanos del product Q sin default Sí.

**Demo:**
1. Invitado → `/productos/traslado360/cuestionario` → Sí/No sin preselección → review → Crear cuenta / Ya tengo cuenta.
2. Login `cliente@demo.ec` / `demo1234` → debe ir a `/checkout/:id` (no a home vacío).
3. `/productos/traslado360/expediente` — solo Traslado; fila unpaid → Pagar → checkout.
4. Divorcio360: `/cuestionario` → login handoff con `next=checkout` intacto.

### 2026-09-13 — Client journey visual language
Alineación del camino cliente a `docs/design.md`: un idioma teal `#2f6f68`, Fraunces solo en H1/wordmark, cuestionario de producto en la misma hoja cinematográfica que Divorcio360, botones canónicos en pago/docs/firma/consulta/caso.

**Demo:**
1. Guest `/productos/traslado360` y `/productos/traslado360/cuestionario`: CTA header y barra de progreso teal, no azul. Wordmark Fraunces.
2. Cuestionario Traslado: folio `01 / 0N`, hoja papel, Sí/No a dos columnas como Divorcio360.
3. Checkout / upload / firma: mismos `.btn` que el cuestionario. H1 Fraunces.
4. `/productos/traslado360/expediente`: H1 Fraunces, densidad workspace.

### 2026-09-13 — Home y product homes design.md
Home `/` y landings de producto usan el mismo papel cream, cards `--radius-lg` / `--shadow-md`, y secciones a alto de contenido (solo el hero es 100svh). Estaciones en grid de contenedor; mock de expediente plano y centrado; Traslado/BienRaiz sin `overflow-x: hidden` ni títulos a 16ch.

**Demo:**
1. `/` desktop: Cinco estaciones alineadas, sin barra horizontal; “Otras ventanas” y Enterprise en cream con texto oscuro sobre card blanca.
2. `/productos/divorcio360`: Cliente/Abogado a la misma altura; `#flujo` mock centrado; Resultado cambia el expediente; `#evidencia` en papel cream.
3. `/productos/traslado360` y `/productos/bienraiz360`: hero 2 col + mock con sombra; planes a la misma base; ~390px sin scroll de documento.

### 2026-09-13 — Firma propia o LegalStation ($15 aparte)
`/firma/:id` tiene dos vías. Subir el PDF/imagen ya firmado no cobra extra. Firmar con LegalStation aplica el fixture `firma-demo.pdf` y registra un cobro mock Payphone de $15 (`payphone_esign_mock`), aparte del paquete. Checkout muestra la línea como “se paga por separado”.

**Demo:**
1. Login `cliente@demo.ec` / `demo1234`. Expediente seed listo para firmar (status 04 + minuta).
2. `/firma/:id`: minuta a la izquierda. Derecha: dropzone propio, o **Pagar $15.00 y firmar**.
3. Plataforma: overlay Payphone demo → sello → estado 05. Abogado `/abogado/caso/:id` pestaña Firmas ve “Firma LegalStation ($15 aparte)”.
4. Checkout del trámite: línea “Firma electrónica LegalStation / Se paga por separado”. El $349 no la incluye.

### 2026-09-13 — Stage del formulario + recorrido en fila + sello demo fuera del home
- Home: el mock del expediente y el stack de documentos ya no dicen “DEMO” (`expediente de ejemplo`, `folio de ejemplo`, `Sello de ejemplo`, `DOCUMENTO FICTICIO`). Legales y `/auth` conservan su aviso.
- Recorrido `#flujo`: 5 estaciones en una fila (fin del scroll lateral), línea de progreso con paquete, nodos con icono, foco con click y ←/→.
- Formulario: stage propio “mesa de expediente” (textura, glows en deriva, barrido de luz, renglones de folio, sello de agua, lavado por categoría, viñeta) con entrada escalonada de la hoja, contador que rueda, barrido de tinta y sello al elegir, sello de veredicto con anillo y precio que sube.
- Motion siempre activo. Solo `transform/opacity/filter`: cero propiedades de layout.

**Demo:** `/cuestionario` (elegir con sello → resultado `$349`) y `/productos/traslado360/cuestionario` (mismo stage).

### 2026-09-13 — Flujo cliente Iniciar Formulario + firma canvas
CTA **Iniciar Formulario** (guest → `/auth?returnUrl=/cuestionario`; cliente → `/cuestionario`). Hero: Mis expedientes + Cómo funciona, CTA principal centrado debajo. Upload vacío en una línea. LegalStation: lienzo Limpiar/Confirmar → overlay Preparando/Procesando/Pago aprobado/Firma registrada → Payphone $15 existente. Recibo con `full_name`/`email` de la sesión.

**Demo:**
1. Guest `/` o `/productos/divorcio360` → Iniciar Formulario → login `cliente@demo.ec` / `demo1234` → `/cuestionario`. Header cliente: chip + Iniciar Formulario.
2. `/upload/11` vacío compacto; `/upload/10` expandido con archivo.
3. `/firma/10`: dibujar, Confirmar, Pagar $15.00 y firmar. Folio cream de confirmación.
4. `/checkout/4` (u otro unpaid): titular Carlos Mendoza y correo `cliente@demo.ec` en formulario y ticket.

### 2026-09-13 — Módulo de servicios del abogado
El bufete arma ofertas propias (nombre, slug, área, honorario, plazo, documentos, preguntas). Persiste en SQLite. Seed: **Denuncia electrónica** $189.

**Demo:**
1. Reiniciar API si el proceso es anterior a este slice. Login `abogado@demo.ec` / `demo1234`.
2. Sidebar **Servicios** → card Denuncia electrónica → Editar (folio + vista previa).
3. **Nuevo servicio** → p. ej. Amparo constitucional $420 → Publicar → F5 conserva.
4. Duplicar / borrar. Filtros Todos / Publicados / Borradores.

### 2026-09-13 — Login → panel por rol
Tras login (o visita a `/auth` ya autenticado), destino por defecto: cliente → `/cliente`, abogado → `/abogado`. `returnUrl=/` y landings marketing ya no pisan el panel. Deep links (`returnUrl=/cuestionario`, `next=checkout`, guards) siguen intactos. CTA **Ingresar** del header/footer ya no manda `returnUrl=/`.

**Demo:** logout → `/` → Ingresar → `cliente@demo.ec` / `demo1234` → `/cliente`. Abogado → `/abogado`. Iniciar Formulario (guest) → login → `/cuestionario`.

### 2026-09-13 — Header menú cuenta + Salir
**Salir** ya no es un enlace siempre visible en `header-actions`. El chip del perfil (p. ej. Carlos) abre un menú con el acceso al panel del rol y **Salir** con icono `log-out`. Campana e Iniciar Formulario siguen en la barra.

**Demo:** login `cliente@demo.ec` → clic en Carlos → Salir en el menú.

### 2026-09-13 — Portal /cliente expediente (no inbox)
`/cliente` deja el wall de KPI-cards y la fila horizontal. Filtros densos (Te toca n · En curso n…). Casos `needsYou` como hoja-expediente: verbo humano, identidad, meta en prosa, CTA primario. El resto en archivo compacto sin 10 pips.

**Demo (30s):** login `cliente@demo.ec` / `demo1234` → `/cliente`. Con caso firmable, el primer viewport es «Firma tu minuta» + Firmar. Cambiar a En curso / Todos: dossiers arriba, archivo abajo.

### 2026-09-13 — Sidebar servicios unificado
Un solo panel SaaS: sidebar con **Todos** + **Servicios** (nombre + descripción corta, conteo solo si > 0) y lista quieta de **Próximamente**. Sin wordmark duplicado (la marca vive en el header). Clic filtra el mismo `/cliente`. Filtros de estado como segmented denso.

**Demo:** `/cliente` → rail LegalStation → Divorcio360 / Traslado360 → Todos.

### 2026-09-13 — Header SaaS en /cliente
`/cliente` ya no es “flujo Divorcio360”: el wordmark es **LegalStation** (logo), sin sub “por LegalStation” de producto. **Iniciar Formulario** se oculta en este panel (el sidebar cubre los servicios). Inicio del nav apunta a `/`.

