# Divorcio360 Landing Improvement Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Convertir `/productos/divorcio360` en una landing clara, honesta, accesible y compacta, conservando una sola firma visual de motion y eliminando patrones genéricos detectados por la auditoría.

**Architecture:** La mejora reutiliza Angular 19, GSAP y los tokens existentes. Centraliza la acción primaria por rol en una función pura, reduce la landing a una sola demostración del expediente, limita GSAP al ciclo de vida del hero y convierte el shell en una superficie sólida sin lógica de scroll. No hay rewrite, backend nuevo ni dependencia nueva.

**Tech Stack:** Angular 19 standalone components, TypeScript 5.7, SCSS, GSAP 3.15 + ScrollTrigger, Jasmine/Karma, Bun workspace scripts.

## Global Constraints

- Alcance principal: `/productos/divorcio360`.
- Mantener Angular 19, GSAP 3.15, Fraunces para display e Inter para texto.
- No agregar dependencias.
- No cambiar APIs ni esquema de base de datos.
- No presentar clientes, integraciones, valores o plazos demo como evidencia real.
- Texto legal visible debe declarar que este entorno es demostración y no asesoría ni cotización.
- Footer debe incluir la frase exacta `Hecho por CodiDevs`.
- Todo movimiento debe respetar `prefers-reduced-motion`.
- Animaciones propias del hero solo pueden limpiar sus propios contextos; prohibido `ScrollTrigger.getAll().forEach(...)`.
- Motion: Jakub principal, Emil secundario, Jhey solo en el reveal circular del expediente.
- Hover usa color u opacidad; no usa desplazamiento, escala, glow ni rebote.
- No usar gradientes decorativos, glassmorphism, botones pill ni radios mayores a `var(--radius-lg)` en esta landing.
- Mantener foco visible, navegación por teclado, landmarks semánticos y contraste WCAG AA.
- Al cerrar el slice, actualizar `docs/DEMO_GOALS.md`.

---

## File Map

Modificar:

- `frontend/src/app/shared/product-sites.data.ts`: contrato único de CTA por rol y contenido honesto de Divorcio360.
- `frontend/src/app/pages/saas/hero-scroll-video-pin-reveal.component.ts`: H1, primer fold, tokens, motion y ownership de GSAP.
- `frontend/src/app/pages/saas/divorcio-landing.component.ts`: composición, eliminación de secciones duplicadas, enlaces reales y estilos scoped.
- `frontend/src/app/pages/saas/landing-statistics.component.ts`: radios y sombra alineados con tokens.
- `frontend/src/app/layout/shell.component.ts`: navegación por sesión, header plano, footer legal y atribución.
- `frontend/src/app/app.routes.ts`: rutas legales.
- `docs/DEMO_GOALS.md`: walkthrough de la mejora terminada.

Crear:

- `PRODUCT.md`: contrato visual y excepción tipográfica de la marca.
- `frontend/src/app/shared/product-sites.data.spec.ts`: CTA por rol y claims permitidos.
- `frontend/src/app/pages/saas/hero-scroll-video-pin-reveal.component.spec.ts`: semántica y cleanup local.
- `frontend/src/app/pages/saas/divorcio-landing.component.spec.ts`: una sola demo y cero hash links.
- `frontend/src/app/layout/shell.component.spec.ts`: navegación sin acciones duplicadas.
- `frontend/src/app/pages/legal/legal-page.component.ts`: privacidad y términos demo desde un único componente.
- `frontend/src/app/pages/legal/legal-page.component.spec.ts`: contenido y rutas legales.

Eliminar:

- `frontend/src/app/pages/saas/cinematic-logo-cloud.component.ts`: queda sin consumidores al retirar la falsa prueba social.

No modificar:

- `frontend/src/styles/tokens.scss`: ya contiene `--primary`, `--primary-hover`, `--text-inverse`, radios y tiempos correctos.
- `frontend/src/styles/landing-shared.scss`: otras landings lo consumen; Divorcio360 neutraliza sus adornos con estilos scoped.
- Backend y flujos posteriores al cuestionario.

---

### Task 1: Centralizar CTA por rol y sanear datos comerciales

**Files:**
- Create: `PRODUCT.md`
- Create: `frontend/src/app/shared/product-sites.data.spec.ts`
- Modify: `frontend/src/app/shared/product-sites.data.ts:61-124`
- Modify: `frontend/src/app/shared/product-sites.data.ts:439-453`

**Interfaces:**
- Produces: `MarketingRole`
- Produces: `MarketingPrimaryAction`
- Produces: `getMarketingPrimaryAction(role, product): MarketingPrimaryAction`
- Preserves: `getProductQuestionnairePath(slug): string`

- [ ] **Step 1: Escribir pruebas fallidas para CTA y copy**

Crear `frontend/src/app/shared/product-sites.data.spec.ts`:

```typescript
import {
  PRODUCT_SITES,
  getMarketingPrimaryAction,
  getProductQuestionnairePath,
} from './product-sites.data';

describe('product-sites.data', () => {
  it('resuelve una sola acción primaria por rol', () => {
    expect(getMarketingPrimaryAction(null, 'divorcio360')).toEqual({
      label: 'Evaluar mi caso',
      path: '/cuestionario',
    });
    expect(getMarketingPrimaryAction('cliente', 'divorcio360')).toEqual({
      label: 'Mis expedientes',
      path: '/cliente',
    });
    expect(getMarketingPrimaryAction('abogado', 'divorcio360')).toEqual({
      label: 'Panel de casos',
      path: '/abogado',
    });
    expect(getMarketingPrimaryAction('notario', 'divorcio360')).toEqual({
      label: 'Inicio',
      path: '/',
    });
  });

  it('conserva la ruta canónica del cuestionario Divorcio360', () => {
    expect(getProductQuestionnairePath('divorcio360')).toBe('/cuestionario');
  });

  it('publica solo métricas verificables dentro de la demostración', () => {
    const site = PRODUCT_SITES['divorcio360'];
    const visibleCopy = JSON.stringify({
      heroLede: site.heroLede,
      workflow: site.workflow,
      values: site.values,
      stats: site.stats,
      plans: site.plans,
    });

    expect(site.stats.map((stat) => stat.value)).toEqual(['6 etapas', '1 expediente', '$349 demo']);
    expect(site.plans.length).toBe(1);
    expect(visibleCopy).not.toMatch(/24\/7|1 click|SLA|timeline|intake|mismo costo/i);
    expect(visibleCopy).toContain('demostración');
  });
});
```

- [ ] **Step 2: Ejecutar la spec y confirmar el fallo**

Run:

```powershell
bun --cwd frontend run test -- --watch=false --browsers=ChromeHeadless --include=src/app/shared/product-sites.data.spec.ts
```

Expected: FAIL porque `getMarketingPrimaryAction` no existe y los datos aún contienen `24/7`, `1 click`, `SLA`, `timeline` e `intake`.

- [ ] **Step 3: Agregar el contrato de acción primaria**

Agregar junto a las interfaces de `product-sites.data.ts`:

```typescript
export type MarketingRole = 'cliente' | 'abogado' | 'notario' | null;

export interface MarketingPrimaryAction {
  label: string;
  path: string;
}
```

Agregar después de `getProductQuestionnairePath`:

```typescript
export function getMarketingPrimaryAction(
  role: MarketingRole,
  product = 'divorcio360',
): MarketingPrimaryAction {
  if (role === 'cliente') return { label: 'Mis expedientes', path: '/cliente' };
  if (role === 'abogado') return { label: 'Panel de casos', path: '/abogado' };
  if (role === 'notario') return { label: 'Inicio', path: '/' };
  return {
    label: 'Evaluar mi caso',
    path: getProductQuestionnairePath(product),
  };
}
```

- [ ] **Step 4: Reemplazar los campos comerciales de Divorcio360**

En `PRODUCT_SITES.divorcio360`, conservar `price`, `docTypes`, `flowSteps`, `questionnaire`, `gallery` y `testimonials`. Reemplazar colores, hero, workflow, values, stats y plans por:

```typescript
accent: 'var(--primary)',
accentDeep: 'var(--primary-hover)',
accentSoft: 'var(--primary-subtle)',
bg: 'var(--bg)',
bgSoft: 'var(--bg-subtle)',
price: 349,
heroTitle: 'Divorcio por mutuo acuerdo',
heroHighlight: 'con seguimiento claro.',
heroLede: 'Evalúa si tu caso encaja y recorre una demostración completa del expediente digital.',
ctaTitle: 'Evalúa si tu caso encaja',
workflow: [
  {
    n: 1,
    title: 'Evaluar',
    desc: 'Cuestionario guiado con un resultado explicado en lenguaje claro.',
    screen: 'Cuestionario',
  },
  {
    n: 2,
    title: 'Confirmar',
    desc: 'Revisión del resultado antes de generar cualquier cobro.',
    screen: 'Resultado',
  },
  {
    n: 3,
    title: 'Documentar',
    desc: 'Carga de cédula y partida para revisión del operador.',
    screen: 'Documentos',
  },
  {
    n: 4,
    title: 'Consultar',
    desc: 'Solicitud de consulta para revisar el expediente con un abogado.',
    screen: 'Consulta',
  },
  {
    n: 5,
    title: 'Firmar',
    desc: 'Carga del documento firmado con fecha y evidencia técnica.',
    screen: 'Firma',
  },
  {
    n: 6,
    title: 'Cerrar',
    desc: 'Seguimiento del cierre dentro del recorrido de demostración.',
    screen: 'Resultado',
  },
],
values: [
  {
    title: 'Evaluación antes del cobro',
    desc: 'El cuestionario explica si el caso puede continuar por este recorrido.',
  },
  {
    title: 'Un expediente compartido',
    desc: 'Cliente y operador consultan documentos, mensajes y estado en el mismo lugar.',
  },
  {
    title: 'Acciones visibles',
    desc: 'Cada etapa muestra qué falta y quién debe realizar la siguiente acción.',
  },
],
stats: [
  {
    label: 'Recorrido visible',
    value: '6 etapas',
    detail: 'De la evaluación al cierre dentro de esta demostración.',
    icon: 'file',
  },
  {
    label: 'Seguimiento centralizado',
    value: '1 expediente',
    detail: 'Documentos, mensajes y estado reunidos en una sola vista.',
    icon: 'users',
  },
  {
    label: 'Valor orientativo',
    value: '$349 demo',
    detail: 'No constituye cotización ni promesa de precio final.',
    icon: 'scale',
  },
],
plans: [
  {
    name: 'Caso por mutuo acuerdo',
    audience: 'Valor de demostración sujeto a revisión',
    price: 349,
    items: [
      'Evaluación inicial',
      'Expediente digital',
      'Revisión documental',
      'Carga de firma',
    ],
    featured: true,
  },
],
```

- [ ] **Step 5: Documentar la excepción de marca**

Crear `PRODUCT.md`:

```markdown
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
```

- [ ] **Step 6: Ejecutar spec y build**

Run:

```powershell
bun --cwd frontend run test -- --watch=false --browsers=ChromeHeadless --include=src/app/shared/product-sites.data.spec.ts
bun run build:frontend
```

Expected: spec PASS y build exitoso.

- [ ] **Step 7: Commit**

```powershell
git add PRODUCT.md frontend/src/app/shared/product-sites.data.ts frontend/src/app/shared/product-sites.data.spec.ts
git commit -m "fix: make Divorcio360 claims honest"
```

---

### Task 2: Corregir jerarquía, contraste y ownership del hero

**Files:**
- Create: `frontend/src/app/pages/saas/hero-scroll-video-pin-reveal.component.spec.ts`
- Modify: `frontend/src/app/pages/saas/hero-scroll-video-pin-reveal.component.ts:1-617`

**Interfaces:**
- Consumes: `getMarketingPrimaryAction`
- Produces: `primaryAction`
- Preserves: selector `app-hero-scroll-video-pin-reveal`
- Preserves: `authQuery` para login

- [ ] **Step 1: Escribir pruebas fallidas de semántica y cleanup**

Crear `frontend/src/app/pages/saas/hero-scroll-video-pin-reveal.component.spec.ts`:

```typescript
import { signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { AuthService } from '../../core/auth.service';
import { HeroScrollVideoPinRevealComponent } from './hero-scroll-video-pin-reveal.component';

function reducedMotionQuery(): MediaQueryList {
  return {
    matches: true,
    media: '(prefers-reduced-motion: reduce)',
    onchange: null,
    addListener: () => undefined,
    removeListener: () => undefined,
    addEventListener: () => undefined,
    removeEventListener: () => undefined,
    dispatchEvent: () => true,
  };
}

describe('HeroScrollVideoPinRevealComponent', () => {
  let fixture: ComponentFixture<HeroScrollVideoPinRevealComponent>;

  beforeEach(async () => {
    spyOn(window, 'matchMedia').and.returnValue(reducedMotionQuery());

    await TestBed.configureTestingModule({
      imports: [HeroScrollVideoPinRevealComponent],
      providers: [
        provideRouter([]),
        {
          provide: AuthService,
          useValue: {
            isLoggedIn: false,
            user: signal(null),
          },
        },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(HeroScrollVideoPinRevealComponent);
    fixture.detectChanges();
  });

  afterEach(() => {
    if (!fixture.componentRef.hostView.destroyed) fixture.destroy();
  });

  it('renderiza un único H1 y la acción primaria en el primer bloque', () => {
    const root = fixture.nativeElement as HTMLElement;

    expect(root.querySelectorAll('h1').length).toBe(1);
    expect(root.querySelector('.hsvr-intro')).toBeNull();
    expect(root.querySelector('.hsvr-tags')).toBeNull();
    expect(root.querySelector('.hsvr-btn-primary')?.getAttribute('href')).toBe('/cuestionario');
  });

  it('no consulta ni destruye ScrollTriggers globales al desmontarse', () => {
    const getAllSpy = spyOn(ScrollTrigger, 'getAll').and.callThrough();

    fixture.destroy();

    expect(getAllSpy).not.toHaveBeenCalled();
  });
});
```

- [ ] **Step 2: Ejecutar la spec y confirmar los dos fallos**

Run:

```powershell
bun --cwd frontend run test -- --watch=false --browsers=ChromeHeadless --include=src/app/pages/saas/hero-scroll-video-pin-reveal.component.spec.ts
```

Expected: FAIL porque el heading sigue siendo `<p>`, existe `.hsvr-intro`, existen tags y `ngOnDestroy` llama `ScrollTrigger.getAll()`.

- [ ] **Step 3: Sustituir el primer bloque del template**

Eliminar `.hsvr-intro`, `.hsvr-tags` y `hsvr-video-caption`. El comienzo de `.hsvr-benefit` debe quedar:

```html
<section class="hsvr-benefit" #benefitRef>
  <div class="hsvr-benefit-inner">
    <div class="hsvr-headline-wrap">
      <h1
        class="hsvr-headline"
        #paraRef
        aria-label="Tu trámite con un plan claro de principio a fin"
      >
        @for (word of headlineWords; track word) {
          <span class="reveal-word">{{ word }}</span>
        }
      </h1>
    </div>

    <p class="hsvr-sub">{{ subText }}</p>

    <div class="hsvr-cta">
      <a [routerLink]="primaryAction.path" class="hsvr-btn hsvr-btn-primary">
        {{ primaryAction.label }}
      </a>

      @if (auth.isLoggedIn && auth.user()?.role === 'cliente') {
        <a href="#flujo" class="hsvr-btn hsvr-btn-outline">Cómo funciona</a>
      } @else if (!auth.isLoggedIn) {
        <a
          routerLink="/auth"
          [queryParams]="authQuery"
          class="hsvr-btn hsvr-btn-outline"
        >Ingresar</a>
      }
    </div>
  </div>

  <div class="hsvr-video-section">
    <!-- conservar hsvr-video-wrap, hsvr-video-box, overlay y un solo hsvr-mock -->
  </div>
</section>
```

La única maqueta visual permanece dentro de `.hsvr-mock`. Mantener `aria-hidden="true"` porque su información se explica después en el flujo visible.

- [ ] **Step 4: Consumir la acción compartida y retirar datos decorativos**

Cambiar el import de datos:

```typescript
import {
  PRODUCT_SITES,
  getMarketingPrimaryAction,
} from '../../shared/product-sites.data';
```

Eliminar `HeroTagItem`, `tags`, el array anterior de `videoOverlayWords` y el caption. Usar:

```typescript
@Input() subText =
  'Evalúa si tu caso encaja y recorre una demostración del expediente, los documentos y la firma.';

videoOverlayWords = [
  'Seguimiento', 'claro', 'en', 'cada', 'etapa.',
];

videoOverlayLabel = 'Seguimiento claro en cada etapa';

get primaryAction() {
  return getMarketingPrimaryAction(this.auth.user()?.role ?? null, 'divorcio360');
}
```

- [ ] **Step 5: Reemplazar estilos críticos del hero**

Eliminar selectores de `.hsvr-intro`, `.hsvr-tags`, `.hsvr-tag`, `.hsvr-video-caption`, transform hover y shadow del botón. Aplicar:

```scss
.hsvr-root,
.hsvr-benefit,
.hsvr-benefit-inner,
.hsvr-video-section,
.hsvr-video-wrap,
.hsvr-video-underlay,
.hsvr-video-box {
  background: var(--surface-inverse);
}

.hsvr-root {
  color: var(--text-inverse);
  overflow-x: hidden;
  font-family: var(--font-sans);
}

.hsvr-benefit-inner {
  min-height: min(42rem, calc(100svh - var(--header-height)));
  max-width: 64rem;
  margin: 0 auto;
  padding: clamp(3.5rem, 8vw, 6rem) 1.25rem 3rem;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  text-align: center;
}

.hsvr-headline {
  margin: 0;
  max-width: 15ch;
  font-family: var(--font-display);
  font-size: clamp(2.35rem, 6vw, 4.75rem);
  font-weight: 600;
  line-height: 1.04;
  letter-spacing: -0.04em;
  color: var(--text-inverse);
  text-wrap: balance;
}

.hsvr-sub {
  margin: 0 0 1.5rem;
  max-width: 38rem;
  font-size: clamp(1rem, 1.5vw, 1.15rem);
  line-height: 1.6;
  color: color-mix(in srgb, var(--text-inverse) 78%, transparent);
}

.hsvr-btn {
  display: inline-flex;
  align-items: center;
  min-height: var(--control-height);
  padding: 0 var(--space-5);
  border-radius: var(--radius-md);
  font-weight: 600;
  font-size: var(--text-sm);
  text-decoration: none;
  transition:
    background var(--dur-fast) var(--ease),
    border-color var(--dur-fast) var(--ease),
    color var(--dur-fast) var(--ease);
}

.hsvr-btn-primary {
  background: var(--primary-hover);
  color: var(--text-on-primary);
}

.hsvr-btn-primary:hover {
  background: var(--primary-active);
}

.hsvr-btn-outline {
  border: 1px solid color-mix(in srgb, var(--text-inverse) 48%, transparent);
  color: var(--text-inverse);
  background: transparent;
}

.hsvr-btn-outline:hover {
  background: color-mix(in srgb, var(--text-inverse) 8%, transparent);
}

.hsvr-btn:focus-visible {
  outline: 2px solid var(--primary-border);
  outline-offset: 3px;
}

.hsvr-mock {
  width: min(36rem, calc(100% - 3rem));
  border-radius: var(--radius-lg);
  border: 1px solid color-mix(in srgb, var(--primary-border) 38%, transparent);
  background: color-mix(in srgb, var(--surface-inverse) 88%, var(--primary));
  box-shadow: none;
  overflow: hidden;
}
```

Reemplazar los `#4a9e96`, `#3a827b` y `rgb(74 158 150 / ...)` restantes del hero por `var(--primary)`, `var(--primary-hover)`, `var(--primary-subtle)` o `color-mix(...)` según su rol.

- [ ] **Step 6: Hacer local el ciclo de vida GSAP**

Agregar propiedad:

```typescript
private gsapCtx?: gsap.Context;
private gsapMedia?: ReturnType<typeof gsap.matchMedia>;
private reducedMotion = false;
```

Reemplazar `ngOnDestroy`:

```typescript
ngOnDestroy(): void {
  this.gsapMedia?.revert();
  this.gsapCtx?.revert();
}
```

Dentro de `initGsap`, eliminar `tagNodes` y su tween. El reveal inicial queda:

```typescript
if (words.length) {
  gsap.from(words, {
    opacity: 0,
    yPercent: 12,
    stagger: 0.035,
    duration: 0.42,
    ease: 'power2.out',
    scrollTrigger: {
      trigger: para,
      start: 'top 82%',
      once: true,
    },
  });
}
```

Reemplazar `const mm = gsap.matchMedia()` por:

```typescript
this.gsapMedia = gsap.matchMedia();
```

Y registrar breakpoints:

```typescript
this.gsapMedia.add(
  '(max-width: 639.9px)',
  () => addMockPin('circle(22% at 50% 50%)', '+=420', 0.85),
);
this.gsapMedia.add(
  '(min-width: 640px) and (max-width: 1023.9px)',
  () => addMockPin('circle(14% at 50% 50%)', '+=650', 0.95),
);
this.gsapMedia.add(
  '(min-width: 1024px)',
  () => addMockPin('circle(10% at 50% 50%)', '+=900', 1),
);
```

No cambiar el fallback estático: debe seguir mostrando texto y mock sin clip cuando reduced motion está activo.

- [ ] **Step 7: Ejecutar spec y build**

Run:

```powershell
bun --cwd frontend run test -- --watch=false --browsers=ChromeHeadless --include=src/app/pages/saas/hero-scroll-video-pin-reveal.component.spec.ts
bun run build:frontend
```

Expected: spec PASS; no errores TypeScript, template ni budget.

- [ ] **Step 8: Commit**

```powershell
git add frontend/src/app/pages/saas/hero-scroll-video-pin-reveal.component.ts frontend/src/app/pages/saas/hero-scroll-video-pin-reveal.component.spec.ts
git commit -m "fix: repair Divorcio360 hero hierarchy"
```

---

### Task 3: Eliminar demo duplicada, prueba social falsa y hash links

**Files:**
- Create: `frontend/src/app/pages/saas/divorcio-landing.component.spec.ts`
- Modify: `frontend/src/app/pages/saas/divorcio-landing.component.ts:1-268`
- Modify: `frontend/src/app/pages/saas/landing-statistics.component.ts:37-147`
- Delete: `frontend/src/app/pages/saas/cinematic-logo-cloud.component.ts`

**Interfaces:**
- Consumes: `getMarketingPrimaryAction`
- Preserves: selector `app-divorcio-landing`
- Preserves: anchors `#flujo`, `#capacidades`, `#precios`

- [ ] **Step 1: Escribir prueba fallida para composición mínima**

Crear `frontend/src/app/pages/saas/divorcio-landing.component.spec.ts`:

```typescript
import { signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { AuthService } from '../../core/auth.service';
import { DivorcioLandingComponent } from './divorcio-landing.component';

function reducedMotionQuery(): MediaQueryList {
  return {
    matches: true,
    media: '(prefers-reduced-motion: reduce)',
    onchange: null,
    addListener: () => undefined,
    removeListener: () => undefined,
    addEventListener: () => undefined,
    removeEventListener: () => undefined,
    dispatchEvent: () => true,
  };
}

describe('DivorcioLandingComponent', () => {
  let fixture: ComponentFixture<DivorcioLandingComponent>;

  beforeEach(async () => {
    spyOn(window, 'matchMedia').and.returnValue(reducedMotionQuery());

    await TestBed.configureTestingModule({
      imports: [DivorcioLandingComponent],
      providers: [
        provideRouter([]),
        {
          provide: AuthService,
          useValue: {
            isLoggedIn: false,
            user: signal(null),
          },
        },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(DivorcioLandingComponent);
    fixture.detectChanges();
  });

  afterEach(() => fixture.destroy());

  it('renderiza una sola demostración del expediente', () => {
    const root = fixture.nativeElement as HTMLElement;

    expect(root.querySelectorAll('.hsvr-mock').length).toBe(1);
    expect(root.querySelector('.ps-mock-ui')).toBeNull();
    expect(root.querySelector('.clc')).toBeNull();
  });

  it('no usa enlaces hash como botones', () => {
    const root = fixture.nativeElement as HTMLElement;

    expect(root.querySelector('a[href="#"]')).toBeNull();
  });
});
```

- [ ] **Step 2: Ejecutar la spec y confirmar el fallo**

Run:

```powershell
bun --cwd frontend run test -- --watch=false --browsers=ChromeHeadless --include=src/app/pages/saas/divorcio-landing.component.spec.ts
```

Expected: FAIL por `.ps-mock-ui`, `.clc` y los enlaces `href="#"`.

- [ ] **Step 3: Quitar las dos secciones que no aportan evidencia**

Eliminar por completo:

- `section.lp-tools-band` con “Míralo en acción” y `.ps-mock-ui`.
- La sección “Confianza de firmas y familias”.
- Import y uso de `CinematicLogoCloudComponent`.
- `LogoCloudClient`.
- `clientLogos`.
- CSS local de `.lp-tools-band`.

La secuencia final queda:

1. Breadcrumb.
2. Hero con una sola demo.
3. Flujo.
4. Valores.
5. Tres métricas honestas.
6. Precio único.
7. CTA final.

- [ ] **Step 4: Reemplazar navegación imperativa por RouterLink**

Cambiar imports:

```typescript
import { RouterLink } from '@angular/router';
import { AuthService } from '../../core/auth.service';
import {
  PRODUCT_SITES,
  getMarketingPrimaryAction,
  setActiveProduct,
} from '../../shared/product-sites.data';
```

Eliminar `Router`, `getProductQuestionnairePath`, `goPrimary()` y `primaryLabel`. Mantener:

```typescript
constructor(public auth: AuthService) {}

get primaryAction() {
  return getMarketingPrimaryAction(this.auth.user()?.role ?? null, 'divorcio360');
}
```

Los tres CTAs usan destino y label compartidos:

```html
<a [routerLink]="primaryAction.path" class="lp-btn lp-btn-primary">
  {{ primaryAction.label }}
</a>
```

El CTA final usa:

```html
<a [routerLink]="primaryAction.path" class="lp-cta-primary">
  {{ primaryAction.label }}
</a>
```

- [ ] **Step 5: Ajustar headings y avisos**

Cambiar:

```html
<h2>Qué muestra esta demostración</h2>
```

en la sección `#capacidades`.

En precios, eliminar `<p class="lp-eyebrow">Pago por trámite</p>` y usar:

```html
<div class="lp-section-head">
  <h2>Un valor orientativo, sin suscripción</h2>
  <p>El monto mostrado pertenece a la demostración y no constituye una cotización.</p>
</div>
```

Después de la lista del plan agregar:

```html
<p class="lp-price-note">
  Si el resultado no encaja en este recorrido, la demostración no genera un cobro automático.
</p>
```

Reemplazar “timeline” por “seguimiento” dentro de `ctaBody`.

- [ ] **Step 6: Aplicar estilos no-slop scoped a Divorcio360**

Reemplazar las variables hex locales por aliases:

```scss
.divorcio-landing {
  --lp-accent: var(--primary);
  --lp-accent-deep: var(--primary-hover);
  --lp-accent-soft: var(--primary-subtle);
  --lp-accent-ink: var(--primary-hover);
  --lp-bg: var(--bg);
  --lp-bg-soft: var(--bg-subtle);
  background: var(--lp-bg);
}

.divorcio-landing::before {
  content: none;
}

.divorcio-landing .lp-section-head {
  margin-inline: 0;
  text-align: left;
}

.divorcio-landing .lp-pricing {
  grid-template-columns: minmax(0, 44rem);
  justify-content: start;
}

.divorcio-landing .lp-plan,
.divorcio-landing .lp-cta-inner {
  border-radius: var(--radius-lg);
  box-shadow: none;
}

.divorcio-landing .lp-plan.featured {
  outline: 0;
  border-color: var(--primary-border);
}

.divorcio-landing .lp-lift:hover {
  transform: none;
  box-shadow: none;
  border-color: var(--primary-border);
}

.divorcio-landing .lp-steps--flow .lp-step::after {
  background: var(--lp-border);
}

.divorcio-landing .lp-cta-inner {
  background: var(--primary-hover);
  text-align: left;
}

.divorcio-landing .lp-cta-inner::before,
.divorcio-landing .lp-cta-inner::after {
  display: none;
}

.divorcio-landing .lp-cta-buttons {
  justify-content: flex-start;
}

.lp-price-note {
  color: var(--text-muted);
  font-size: var(--text-sm);
}

@media (max-width: 720px) {
  .divorcio-landing .lp-steps--flow .lp-step {
    display: grid;
    grid-template-columns: 2rem 1fr;
    column-gap: var(--space-3);
    align-items: start;
  }

  .divorcio-landing .lp-step-num {
    grid-row: 1 / span 2;
    margin: 0;
  }

  .divorcio-landing .lp-section {
    padding-block: var(--space-7);
  }
}
```

- [ ] **Step 7: Reducir radios y sombra del componente de estadísticas**

En `landing-statistics.component.ts`, conservar template e inputs. Reemplazar solo estas reglas:

```scss
.ls-stat {
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: var(--radius-md);
  padding: 1.35rem 1.25rem;
  box-shadow: var(--shadow-sm);
  display: grid;
  gap: 0.35rem;
}

.ls-stats--band {
  gap: 0;
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: var(--radius-md);
  overflow: hidden;
}
```

El círculo del icono puede permanecer: comunica iconografía funcional y no aparece en variante `band`.

- [ ] **Step 8: Borrar el componente de marquee sin consumidores**

Verificar primero:

```powershell
rg "CinematicLogoCloudComponent|app-cinematic-logo-cloud" frontend/src
```

Expected: solo aparece el archivo del componente.

Eliminar:

```powershell
Remove-Item frontend/src/app/pages/saas/cinematic-logo-cloud.component.ts
```

- [ ] **Step 9: Ejecutar spec, build y control de referencias**

Run:

```powershell
bun --cwd frontend run test -- --watch=false --browsers=ChromeHeadless --include=src/app/pages/saas/divorcio-landing.component.spec.ts
bun run build:frontend
rg "href=\"#\"|CinematicLogoCloudComponent|app-cinematic-logo-cloud" frontend/src/app/pages/saas
```

Expected: spec PASS, build exitoso y `rg` sin coincidencias en Divorcio360.

- [ ] **Step 10: Commit**

```powershell
git add frontend/src/app/pages/saas/divorcio-landing.component.ts frontend/src/app/pages/saas/divorcio-landing.component.spec.ts frontend/src/app/pages/saas/landing-statistics.component.ts
git add -u frontend/src/app/pages/saas/cinematic-logo-cloud.component.ts
git commit -m "refactor: simplify Divorcio360 landing"
```

---

### Task 4: Unificar navegación por sesión y aplanar el header

**Files:**
- Create: `frontend/src/app/layout/shell.component.spec.ts`
- Modify: `frontend/src/app/layout/shell.component.ts:1-1193`

**Interfaces:**
- Consumes: `getMarketingPrimaryAction`
- Preserves: `guestActions`, `navLinks`, `homeForRole`, `roleHomeLabel`
- Removes: `headerScrolled`, `onWindowScroll`

- [ ] **Step 1: Escribir prueba fallida de navegación**

Crear `frontend/src/app/layout/shell.component.spec.ts`:

```typescript
import { signal } from '@angular/core';
import { ViewportScroller } from '@angular/common';
import { Router } from '@angular/router';
import { EMPTY } from 'rxjs';
import { ApiService } from '../core/api.service';
import { AuthService, User } from '../core/auth.service';
import { ShellComponent } from './shell.component';

function makeShell(role: User['role'] | null): ShellComponent {
  const user = role
    ? {
        id: 1,
        email: `${role}@demo.ec`,
        full_name: role === 'cliente' ? 'Carlos Demo' : 'Operador Demo',
        phone: '0000000000',
        role,
      }
    : null;

  const auth = {
    isLoggedIn: role !== null,
    user: signal(user),
    logout: () => undefined,
  } as unknown as AuthService;

  const router = {
    url: '/productos/divorcio360',
    events: EMPTY,
  } as unknown as Router;

  const shell = new ShellComponent(
    auth,
    router,
    {} as ApiService,
    {} as ViewportScroller,
  );
  shell.isDivorcioMarketing = true;
  shell.activeProduct = 'divorcio360';
  return shell;
}

describe('ShellComponent marketing navigation', () => {
  it('no duplica acciones de cuenta dentro de la navegación de secciones', () => {
    const shell = makeShell('cliente');

    expect(shell.navLinks.map((link) => link.label)).toEqual([
      'Inicio',
      'Cómo funciona',
      'Precios',
    ]);
  });

  it('usa la misma acción primaria que la landing para cada rol', () => {
    const client = makeShell('cliente');
    const lawyer = makeShell('abogado');

    expect([client.roleHomeLabel, client.homeForRole]).toEqual([
      'Mis expedientes',
      '/cliente',
    ]);
    expect([lawyer.roleHomeLabel, lawyer.homeForRole]).toEqual([
      'Panel de casos',
      '/abogado',
    ]);
  });

  it('mantiene ingreso y evaluación como únicas acciones guest', () => {
    const guest = makeShell(null);

    expect(guest.guestActions.map(({ label, path }) => ({ label, path }))).toEqual([
      { label: 'Ingresar', path: '/auth' },
      { label: 'Evaluar mi caso', path: '/cuestionario' },
    ]);
  });
});
```

- [ ] **Step 2: Ejecutar spec y confirmar el fallo**

Run:

```powershell
bun --cwd frontend run test -- --watch=false --browsers=ChromeHeadless --include=src/app/layout/shell.component.spec.ts
```

Expected: FAIL porque cliente recibe “Evaluar mi caso” y “Mis expedientes” dentro de `navLinks`, y abogado usa label distinto.

- [ ] **Step 3: Consumir la acción compartida**

Agregar `getMarketingPrimaryAction` al import de `product-sites.data`.

Eliminar el bloque que añade links por sesión al final de `navLinks`. La navegación marketing solo describe secciones; la acción de cuenta permanece en `header-actions` y `mobile-menu-actions`.

Agregar:

```typescript
get sessionAction() {
  return getMarketingPrimaryAction(
    this.auth.user()?.role ?? null,
    this.activeProduct,
  );
}
```

Reemplazar:

```typescript
get homeForRole(): string {
  return this.sessionAction.path;
}

get roleHomeLabel(): string {
  return this.sessionAction.label;
}
```

En `guestActions`, reutilizar:

```typescript
const primary = getMarketingPrimaryAction(null, this.activeProduct);

return [
  { label: 'Ingresar', path: '/auth', query, variant: 'quiet' },
  { ...primary, variant: 'primary' },
];
```

- [ ] **Step 4: Eliminar lógica global de scroll**

Quitar del template:

```html
[class.is-scrolled]="headerScrolled"
```

Eliminar:

```typescript
headerScrolled = false;
```

Eliminar:

```typescript
@HostListener('window:scroll')
onWindowScroll(): void {
  this.headerScrolled = (window.scrollY || 0) > 12;
}
```

Conservar `HostListener` porque aún se usa para click de documento y tecla Escape.

- [ ] **Step 5: Sustituir la isla glass por header sólido**

Eliminar reglas `.site-header.on-marketing.is-scrolled` y reemplazar el bloque marketing por:

```scss
.site-header.on-marketing {
  padding: 0;
  pointer-events: auto;
  background: var(--bg);
  border-bottom: 1px solid var(--border);
  backdrop-filter: none;
  -webkit-backdrop-filter: none;
}

.site-header.on-marketing .header-bar {
  max-width: var(--container-wide);
  min-height: var(--header-height);
  gap: var(--space-4);
  padding-inline: var(--container-pad);
  border: 0;
  border-radius: 0;
  background: transparent;
  box-shadow: none;
}

.site-header.on-marketing .brand {
  font-family: var(--font-display);
  font-weight: 600;
  letter-spacing: -0.03em;
}

.site-header.on-marketing .brand-mark {
  width: 2rem;
  height: 2rem;
  border-radius: var(--radius-sm);
  background: var(--primary-subtle);
  box-shadow: none;
}

.site-header.on-marketing .nav-link,
.site-header.on-marketing .dropdown-trigger {
  padding: var(--space-2);
  border-radius: var(--radius-sm);
  transition:
    color var(--dur-fast) var(--ease),
    background var(--dur-fast) var(--ease);
}

.site-header.on-marketing .btn-primary {
  border-radius: var(--radius-md);
  padding-inline: var(--space-4);
  box-shadow: none;
}

.site-header.on-marketing .mobile-menu {
  margin: 0;
  border-radius: 0 0 var(--radius-lg) var(--radius-lg);
  background: var(--bg);
  backdrop-filter: none;
  -webkit-backdrop-filter: none;
  box-shadow: none;
}
```

- [ ] **Step 6: Ejecutar spec y build**

Run:

```powershell
bun --cwd frontend run test -- --watch=false --browsers=ChromeHeadless --include=src/app/layout/shell.component.spec.ts
bun run build:frontend
```

Expected: spec PASS y build exitoso.

- [ ] **Step 7: Commit**

```powershell
git add frontend/src/app/layout/shell.component.ts frontend/src/app/layout/shell.component.spec.ts
git commit -m "fix: unify marketing navigation"
```

---

### Task 5: Publicar rutas legales honestas y atribución CodiDevs

**Files:**
- Create: `frontend/src/app/pages/legal/legal-page.component.ts`
- Create: `frontend/src/app/pages/legal/legal-page.component.spec.ts`
- Modify: `frontend/src/app/app.routes.ts:1-71`
- Modify: `frontend/src/app/layout/shell.component.ts:258-270`

**Interfaces:**
- Produces routes: `/legal/privacidad`, `/legal/terminos`
- Produces route data: `legalDocument: 'privacy' | 'terms'`
- Preserves: `mailto:soporte@legalstation.ec`

- [ ] **Step 1: Escribir prueba fallida de contenido y rutas**

Crear `frontend/src/app/pages/legal/legal-page.component.spec.ts`:

```typescript
import { TestBed } from '@angular/core/testing';
import { ActivatedRoute } from '@angular/router';
import { routes } from '../../app.routes';
import { LegalPageComponent } from './legal-page.component';

describe('LegalPageComponent', () => {
  it('declara límites de la demostración en privacidad', async () => {
    await TestBed.configureTestingModule({
      imports: [LegalPageComponent],
      providers: [
        {
          provide: ActivatedRoute,
          useValue: {
            snapshot: {
              data: { legalDocument: 'privacy' },
            },
          },
        },
      ],
    }).compileComponents();

    const fixture = TestBed.createComponent(LegalPageComponent);
    fixture.detectChanges();
    const text = (fixture.nativeElement as HTMLElement).textContent ?? '';

    expect(text).toContain('Política de datos');
    expect(text).toContain('No ingreses datos personales reales');
    expect(text).toContain('LOPDP');
  });

  it('registra privacidad y términos dentro del shell', () => {
    const shellRoutes = routes.find((route) => route.path === '')?.children ?? [];

    expect(shellRoutes.some((route) => route.path === 'legal/privacidad')).toBeTrue();
    expect(shellRoutes.some((route) => route.path === 'legal/terminos')).toBeTrue();
  });
});
```

- [ ] **Step 2: Ejecutar spec y confirmar el fallo**

Run:

```powershell
bun --cwd frontend run test -- --watch=false --browsers=ChromeHeadless --include=src/app/pages/legal/legal-page.component.spec.ts
```

Expected: FAIL porque `LegalPageComponent` y ambas rutas no existen.

- [ ] **Step 3: Crear un único componente legal**

Crear `frontend/src/app/pages/legal/legal-page.component.ts`:

```typescript
import { Component } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';

type LegalDocumentKind = 'privacy' | 'terms';

@Component({
  selector: 'app-legal-page',
  standalone: true,
  imports: [RouterLink],
  template: `
    <article class="legal-page">
      <a routerLink="/" class="legal-back">Volver a LegalStation</a>

      @if (kind === 'privacy') {
        <h1>Política de datos</h1>
        <p class="legal-notice">
          Versión para entorno de demostración. No ingreses datos personales reales.
        </p>

        <section>
          <h2>Qué información usa esta demo</h2>
          <p>
            Las cuentas, expedientes, documentos, pagos y firmas mostrados deben contener
            información ficticia creada exclusivamente para probar el recorrido.
          </p>
        </section>

        <section>
          <h2>Para qué se usa</h2>
          <p>
            La información permite demostrar evaluación, seguimiento del expediente,
            carga documental y firma. No se usa para prestar asesoría jurídica real.
          </p>
        </section>

        <section>
          <h2>Antes de producción</h2>
          <p>
            Una operación real debe sustituir este texto por una política revisada
            conforme a la LOPDP y definir conservación, responsables y derechos del titular.
          </p>
        </section>
      } @else {
        <h1>Términos de uso</h1>
        <p class="legal-notice">
          Divorcio360 funciona aquí como demostración de producto.
        </p>

        <section>
          <h2>Sin asesoría ni cotización</h2>
          <p>
            El contenido no constituye asesoría legal, cotización, contrato ni promesa
            de plazo. Los valores y resultados visibles son ilustrativos.
          </p>
        </section>

        <section>
          <h2>Uso de información ficticia</h2>
          <p>
            No cargues cédulas, partidas, firmas ni información personal real en este entorno.
          </p>
        </section>

        <section>
          <h2>Contacto</h2>
          <p>
            Reporta dudas o problemas a
            <a href="mailto:soporte@legalstation.ec">soporte&#64;legalstation.ec</a>.
          </p>
        </section>
      }
    </article>
  `,
  styles: [`
    .legal-page {
      width: min(100% - 2rem, 48rem);
      margin-inline: auto;
      padding-block: var(--space-7) var(--space-9);
      color: var(--text);
    }

    .legal-back {
      display: inline-block;
      margin-bottom: var(--space-6);
      color: var(--primary);
      font-size: var(--text-sm);
      font-weight: 600;
    }

    h1 {
      margin: 0;
      font-family: var(--font-display);
      font-size: clamp(2.25rem, 6vw, 4rem);
      line-height: 1.05;
      letter-spacing: -0.04em;
    }

    .legal-notice {
      margin: var(--space-5) 0 var(--space-7);
      padding: var(--space-4);
      border: 1px solid var(--warning-border);
      border-radius: var(--radius-md);
      background: var(--warning-subtle);
      color: var(--text);
    }

    section {
      padding-block: var(--space-5);
      border-top: 1px solid var(--border);
    }

    h2 {
      margin: 0 0 var(--space-2);
      font-size: var(--text-xl);
    }

    p {
      margin: 0;
      max-width: 65ch;
      color: var(--text-secondary);
      line-height: var(--leading-normal);
    }

    a {
      color: var(--primary);
    }
  `],
})
export class LegalPageComponent {
  readonly kind = this.route.snapshot.data['legalDocument'] as LegalDocumentKind;

  constructor(private route: ActivatedRoute) {}
}
```

- [ ] **Step 4: Registrar rutas**

Importar:

```typescript
import { LegalPageComponent } from './pages/legal/legal-page.component';
```

Agregar dentro de los children de `ShellComponent`, después de `auth`:

```typescript
{
  path: 'legal/privacidad',
  component: LegalPageComponent,
  data: { legalDocument: 'privacy' },
},
{
  path: 'legal/terminos',
  component: LegalPageComponent,
  data: { legalDocument: 'terms' },
},
```

- [ ] **Step 5: Convertir placeholders del footer en links**

Reemplazar:

```html
<span class="footer-soon">Política de datos</span>
<span class="footer-soon">Términos de uso</span>
```

por:

```html
<a routerLink="/legal/privacidad">Política de datos</a>
<a routerLink="/legal/terminos">Términos de uso</a>
```

Reemplazar `footer-bottom` por:

```html
<div class="shell footer-bottom">
  <span>© 2026 LegalStation</span>
  <span>Hecho por CodiDevs</span>
</div>
```

Esto retira además el claim no sustentado “Pagos y firmas procesados de forma segura”.

- [ ] **Step 6: Ejecutar spec, build y prueba de rutas**

Run:

```powershell
bun --cwd frontend run test -- --watch=false --browsers=ChromeHeadless --include=src/app/pages/legal/legal-page.component.spec.ts
bun run build:frontend
```

Con servidor activo, abrir:

- `http://localhost:4200/legal/privacidad`
- `http://localhost:4200/legal/terminos`

Expected: ambas rutas cargan dentro del shell, tienen un H1, explican el carácter demo y permiten volver a LegalStation.

- [ ] **Step 7: Commit**

```powershell
git add frontend/src/app/app.routes.ts frontend/src/app/layout/shell.component.ts frontend/src/app/pages/legal/legal-page.component.ts frontend/src/app/pages/legal/legal-page.component.spec.ts
git commit -m "feat: add demo legal pages"
```

---

### Task 6: Verificar accesibilidad, responsive, motion y recorrido por rol

**Files:**
- Modify: `docs/DEMO_GOALS.md`

**Interfaces:**
- Verifies: `/productos/divorcio360`
- Verifies: `/legal/privacidad`
- Verifies: `/legal/terminos`
- Verifies roles: guest, `cliente`, `abogado`

- [ ] **Step 1: Ejecutar suite completa y build**

Run desde raíz:

```powershell
bun run doctor
bun run test:frontend
bun run build:frontend
git diff --check
```

Expected:

- Doctor no reporta herramienta requerida ausente.
- Todas las specs PASS.
- Build Angular exitoso.
- `git diff --check` sin whitespace errors.

- [ ] **Step 2: Levantar frontend si no está activo**

Run:

```powershell
bun run dev:frontend
```

Expected: aplicación disponible en `http://localhost:4200`.

- [ ] **Step 3: Medir estructura desktop**

Abrir `http://localhost:4200/productos/divorcio360` como guest en viewport `1276x806`, mantener scroll en `0` y ejecutar en consola:

```javascript
(() => {
  const cta = document.querySelector('.hsvr-btn-primary');
  const rect = cta?.getBoundingClientRect();
  const text = document.body.innerText;

  return {
    h1Count: document.querySelectorAll('main h1').length,
    ctaVisible: !!rect && rect.top >= 0 && rect.bottom <= innerHeight,
    hashButtons: document.querySelectorAll('a[href="#"]').length,
    heroMocks: document.querySelectorAll('.hsvr-mock').length,
    duplicateMocks: document.querySelectorAll('.ps-mock-ui').length,
    logoMarquees: document.querySelectorAll('.clc-marquee').length,
    bannedClaims: ['24/7', '1 click', 'SLA', 'Timeline', 'intake']
      .filter((claim) => text.includes(claim)),
  };
})()
```

Expected:

```javascript
{
  h1Count: 1,
  ctaVisible: true,
  hashButtons: 0,
  heroMocks: 1,
  duplicateMocks: 0,
  logoMarquees: 0,
  bannedClaims: []
}
```

- [ ] **Step 4: Medir contraste calculado**

Ejecutar:

```javascript
(() => {
  const rgb = (value) => value.match(/\d+(\.\d+)?/g).slice(0, 3).map(Number);
  const channel = (value) => {
    const normalized = value / 255;
    return normalized <= 0.03928
      ? normalized / 12.92
      : Math.pow((normalized + 0.055) / 1.055, 2.4);
  };
  const luminance = (value) => {
    const [r, g, b] = rgb(value).map(channel);
    return 0.2126 * r + 0.7152 * g + 0.0722 * b;
  };
  const ratio = (foreground, background) => {
    const a = luminance(foreground);
    const b = luminance(background);
    return (Math.max(a, b) + 0.05) / (Math.min(a, b) + 0.05);
  };

  const hero = document.querySelector('.hsvr-root');
  const heading = document.querySelector('.hsvr-headline');
  const button = document.querySelector('.hsvr-btn-primary');

  return {
    heading: ratio(
      getComputedStyle(heading).color,
      getComputedStyle(hero).backgroundColor,
    ).toFixed(2),
    primaryButton: ratio(
      getComputedStyle(button).color,
      getComputedStyle(button).backgroundColor,
    ).toFixed(2),
  };
})()
```

Expected: `heading >= 4.50` y `primaryButton >= 4.50`.

- [ ] **Step 5: Medir móvil**

Cambiar viewport a `390x844`, recargar en scroll `0` y ejecutar:

```javascript
(() => {
  const cta = document.querySelector('.hsvr-btn-primary')?.getBoundingClientRect();
  return {
    ctaVisible: !!cta && cta.top >= 0 && cta.bottom <= innerHeight,
    scrollHeight: document.documentElement.scrollHeight,
    horizontalOverflow: document.documentElement.scrollWidth > innerWidth,
  };
})()
```

Expected:

- `ctaVisible: true`.
- `scrollHeight <= 6500`.
- `horizontalOverflow: false`.
- Flujo legible como lista compacta.
- Precio único, no tres torres.

- [ ] **Step 6: Verificar reduced motion**

Activar `prefers-reduced-motion: reduce`, recargar y confirmar:

- H1, subtítulo, CTA y mock visibles inmediatamente.
- No pin prolongado.
- No marquee.
- No transform hover.
- Navegar a `/` y volver no elimina animaciones de otros componentes.
- Consola sin errores GSAP.

- [ ] **Step 7: Verificar matriz de sesión**

Guest:

- Header: `Ingresar` + `Evaluar mi caso`.
- Hero, precio y CTA final: `Evaluar mi caso` → `/cuestionario`.

Cliente `cliente@demo.ec` / `demo1234`:

- Header y menú móvil: una sola acción `Mis expedientes`.
- Hero, precio y CTA final: `Mis expedientes` → `/cliente`.
- No aparece `Evaluar mi caso`.

Abogado `abogado@demo.ec` / `demo1234`:

- Header y menú móvil: una sola acción `Panel de casos`.
- Hero, precio y CTA final: `Panel de casos` → `/abogado`.
- No aparece `Evaluar mi caso`.

- [ ] **Step 8: Verificar footer y teclado**

Confirmar:

- Texto exacto `Hecho por CodiDevs`.
- `Política de datos` abre `/legal/privacidad`.
- `Términos de uso` abre `/legal/terminos`.
- Tab recorre header, CTA, links y footer con foco visible.
- Skip link llega a `#contenido`.
- Escape cierra menús abiertos.

- [ ] **Step 9: Registrar el slice en DEMO_GOALS**

Agregar a la tabla superior:

```markdown
| done | Divorcio360 no-slop repair | `/productos/divorcio360` — CTA above-fold, una demo, copy honesto, legales | 2026-09-06 |
```

Agregar al final:

```markdown
### 2026-09-06 — Divorcio360 no-slop repair
- Hero con un H1, contraste AA y CTA visible sin scroll.
- Una sola demo del expediente; sin marquee ni prueba social ficticia.
- Navegación coherente para invitado, cliente y abogado.
- Motion local a su componente y fallback completo para reduced motion.
- Política de datos, términos demo y footer `Hecho por CodiDevs`.

**Demo:** `/productos/divorcio360` como guest → cliente → abogado; revisar móvil 390px y reduced motion.
```

- [ ] **Step 10: Verificación final y commit**

Run:

```powershell
bun run test:frontend
bun run build:frontend
git diff --check
git status --short
```

Expected: tests y build exitosos; status contiene solo archivos de este plan y cualquier trabajo previo del usuario permanece intacto.

Commit:

```powershell
git add docs/DEMO_GOALS.md
git commit -m "docs: record Divorcio360 UI repair"
```

---

## Self-Review Result

- Cobertura: los 15 hallazgos del audit quedan resueltos o eliminados desde su raíz.
- Scope: frontend de la landing, shell compartido y dos páginas legales demo; backend intacto.
- Dependencias: ninguna nueva.
- Reuso: tokens, RouterLink, AuthService, PRODUCT_SITES, GSAP y Karma existentes.
- Riesgo principal: estilos del shell son compartidos; su spec y spot-check de `/` reducen regresión.
- Upgrade path: contenido legal real y logos verificables solo entran cuando CodiDevs tenga texto aprobado y permisos de uso.

