import { Component, OnInit } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { ApiService, CaseItem } from '../../core/api.service';
import { IconComponent, IconName } from '../../shared/icon.component';
import { CASE_STATUS_ICONS } from '../../shared/case-progress.model';
import { caseClientHint, caseShort } from '../../shared/case-status.data';
import {
  LEGALSTATION_CATALOG,
  ProductCatalogEntry,
  getProductDisplayName,
  getProductQuestionnairePath,
  normalizeProductId,
  setActiveProduct,
} from '../../shared/product-sites.data';
import { ClientDivorcioDeskComponent } from './client-divorcio-desk.component';
import {
  ProductDeskStepId,
  buildProductSteps,
  caseUrgency,
  currentProductStep,
  formatDateLong,
  formatDateShort,
  isTimelineProduct,
  pickProductCase,
  productSideDesc,
} from './divorcio-steps';

type Filter = 'action' | 'open' | 'done' | 'all';

@Component({
  selector: 'app-client-panel',
  standalone: true,
  imports: [RouterLink, IconComponent, ClientDivorcioDeskComponent],
  template: `
    <div class="client-workspace">
      <aside class="client-sidebar" aria-label="Servicios LegalStation">
        <nav class="side-nav" aria-label="Vista del panel">
          <button
            type="button"
            class="side-item"
            [class.on]="product === 'all'"
            [attr.aria-pressed]="product === 'all'"
            (click)="setProduct('all')"
          >
            <span class="side-item-copy">
              <span class="side-item-name">Todos</span>
              <span class="side-item-desc">Expedientes activos y archivo</span>
            </span>
            @if (cases.length) {
              <span class="side-count tabular">{{ cases.length }}</span>
            }
          </button>
        </nav>

        <div class="side-block">
          <p class="side-label" id="client-nav-live">Servicios</p>
          <nav class="side-nav" aria-labelledby="client-nav-live">
            @for (s of liveServices; track s.id) {
              <div class="side-service" [class.is-expanded]="product === s.id && isDeskProduct(s.id)">
                <button
                  type="button"
                  class="side-item"
                  [class.on]="product === s.id"
                  [attr.aria-pressed]="product === s.id"
                  [attr.aria-expanded]="isDeskProduct(s.id) ? product === s.id : null"
                  [attr.title]="s.tagline"
                  (click)="setProduct(s.id)"
                >
                  <span class="side-item-copy">
                    <span class="side-item-name">{{ s.name }}</span>
                    <span class="side-item-desc">
                      {{ isDeskProduct(s.id) ? productSideDesc(s.id) : s.pillDesc }}
                    </span>
                  </span>
                  @if (isDeskProduct(s.id)) {
                    @if (deskCaseFor(s.id)) {
                      <span class="side-count tabular">1</span>
                    }
                  } @else if (countProductTotal(s.id) > 0) {
                    <span class="side-count tabular">{{ countProductTotal(s.id) }}</span>
                  }
                </button>

                @if (isDeskProduct(s.id) && product === s.id) {
                  <ol class="side-timeline" [attr.aria-label]="'Pasos ' + s.name">
                    @for (step of deskTimeline; track step.id) {
                      <li>
                        <button
                          type="button"
                          class="side-step"
                          [class.on]="deskStep === step.id"
                          [class.done]="step.state === 'done'"
                          [class.current]="step.state === 'current'"
                          [class.locked]="step.state === 'locked'"
                          [disabled]="step.state === 'locked' && !deskCase"
                          (click)="selectDeskStep(step.id)"
                        >
                          <span class="side-step-rail" aria-hidden="true">
                            <span class="side-step-dot">
                              @if (step.state === 'done') {
                                <app-icon name="check" [size]="10" [strokeWidth]="2.6" />
                              }
                            </span>
                          </span>
                          <span class="side-step-label">{{ step.label }}</span>
                        </button>
                      </li>
                    }
                  </ol>
                }
              </div>
            }
          </nav>
        </div>

        @if (soonServices.length) {
          <div class="side-block side-block--soon">
            <p class="side-label" id="client-nav-soon">Próximamente</p>
            <ul class="side-soon-list" aria-labelledby="client-nav-soon">
              @for (s of soonServices; track s.id) {
                <li>{{ s.name }}</li>
              }
            </ul>
          </div>
        }
      </aside>

      <div class="client-main">
        <header class="inbox-head">
          <h1>{{ pageTitle }}</h1>
          <p class="inbox-lede">{{ pageLede }}</p>
        </header>

        @if (loading) {
          <div class="panel state-loading" role="status">
            <span class="spinner" aria-hidden="true"></span>
            <span>Cargando tus trámites…</span>
          </div>
        } @else if (error) {
          <div class="panel state-error" role="alert">
            <span class="state-error-icon"><app-icon name="alert-triangle" [size]="20" /></span>
            <div class="state-error-body">
              <strong>No pudimos cargar tu cuenta</strong>
              <p>Puede ser un problema de conexión. Inténtalo de nuevo en un momento.</p>
            </div>
            <button type="button" class="btn btn-secondary" (click)="load()">Volver a intentar</button>
          </div>
        } @else if (isDeskProduct(product) && countProductTotal(product) === 0) {
          <div class="desk-shell is-loose">
            <app-client-divorcio-desk
              [product]="product"
              [caseItem]="deskCase"
              [step]="deskStep"
              (goStep)="selectDeskStep($event)"
              (caseChanged)="onDeskCaseChanged($event)"
            />
          </div>
        } @else if (!cases.length && product === 'all') {
          <div class="panel empty-state">
            <span class="empty-icon"><app-icon name="inbox" [size]="22" /></span>
            <h2>Todavía no tienes trámites</h2>
            <p>Elige un servicio en la barra lateral e inicia tu primer expediente.</p>
            <button type="button" class="btn btn-primary" (click)="setProduct('divorcio360')">Abrir Divorcio360</button>
          </div>
        } @else {
          <div class="inbox-cases">
            <div class="seg" role="group" aria-label="Filtrar trámites">
              @for (f of filterDefs; track f.id) {
                <button
                  type="button"
                  class="seg-btn"
                  [class.on]="filter === f.id"
                  [attr.aria-pressed]="filter === f.id"
                  (click)="setFilter(f.id)"
                >
                  {{ f.label }}
                  <span class="seg-n tabular">{{ countFor(f.id) }}</span>
                </button>
              }
            </div>

            @if (!filtered.length) {
              <div class="panel empty-state">
                <span class="empty-icon"><app-icon name="search" [size]="22" /></span>
                <h2>Nada en «{{ filterLabel }}»</h2>
                @if (product !== 'all' && countProductTotal(product) === 0) {
                  <p>Aún no tienes trámites de {{ selectedServiceName }}. Puedes iniciar uno ahora.</p>
                  <a [routerLink]="startPath" class="btn btn-primary">Iniciar {{ selectedServiceName }}</a>
                  <button type="button" class="btn btn-secondary" (click)="setProduct('all')">Ver todos</button>
                } @else {
                  <p>
                    @if (cases.length) {
                      Hay {{ cases.length }} trámites en tu cuenta. Este recorte está vacío.
                    } @else {
                      Este recorte está vacío.
                    }
                  </p>
                  <button type="button" class="btn btn-secondary" (click)="clearFilters()">Ver todos</button>
                }
              </div>
            } @else {
              @let openId = openCaseId;

              @if (actionInView.length) {
                <section class="dossier-grid" [attr.aria-label]="'Te toca: ' + filterLabel">
                  @for (c of actionInView; track trackKey(c); let i = $index) {
                    <div
                      class="dossier-cell"
                      [class.is-open]="openId === c.id"
                      [class.is-pay]="!c.paid"
                      [style.--i]="i"
                    >
                      <button
                        type="button"
                        class="dossier"
                        [attr.aria-expanded]="openId === c.id"
                        [attr.aria-controls]="'case-panel-' + c.id"
                        (click)="activateCase(c)"
                      >
                        <div class="dossier-body">
                          <h2 class="dossier-title">{{ dossierTitle(c) }}</h2>
                          <p class="dossier-id">
                            {{ productName(c) }} · #{{ c.id }} · {{ cityLine(c) }}
                          </p>
                          <p class="dossier-hint">{{ nextHint(c) }}</p>
                          @if (openId === c.id) {
                            <dl class="dossier-facts">
                              @for (f of caseFacts(c); track f.label) {
                                <div class="dossier-fact">
                                  <dt>{{ f.label }}</dt>
                                  <dd>{{ f.value }}</dd>
                                </div>
                              }
                            </dl>
                          }
                          <span class="dossier-track" role="img" [attr.aria-label]="trackLabel(c)">
                            @for (s of productSteps(c); track s.id) {
                              <i [class]="'is-' + s.state"></i>
                            }
                          </span>
                          @if (openId !== c.id) {
                            <dl class="dossier-facts">
                              @for (f of tileSpecs(c); track f.label) {
                                <div class="dossier-fact">
                                  <dt>{{ f.label }}</dt>
                                  <dd>{{ f.value }}</dd>
                                </div>
                              }
                            </dl>
                          }
                        </div>
                        @if (openId === c.id) {
                          <p class="dossier-meta">{{ metaLine(c) }}</p>
                        } @else {
                          <span class="dossier-cta btn btn-primary">
                            <app-icon [name]="stageIcon(c)" [size]="16" />
                            {{ goLabel(c) }}
                            <app-icon name="arrow-right" [size]="16" />
                          </span>
                        }
                      </button>

                      @if (openId === c.id) {
                        <div class="desk-shell" [attr.id]="'case-panel-' + c.id">
                          <app-client-divorcio-desk
                            [product]="product"
                            [caseItem]="c"
                            [step]="deskStep"
                            [embedded]="true"
                            (goStep)="selectDeskStep($event)"
                            (caseChanged)="onDeskCaseChanged($event)"
                          />
                        </div>
                      }
                    </div>
                  }
                </section>
              }

              @if (archiveInView.length) {
                <section class="archive" [attr.aria-label]="archiveHeading">
                  <h2 class="archive-head">{{ archiveHeading }}</h2>
                  <ul class="archive-list">
                    @for (c of archiveInView; track trackKey(c); let i = $index) {
                      <li class="dossier-cell" [class.is-open]="openId === c.id">
                        <button
                          type="button"
                          class="archive-row"
                          [attr.aria-expanded]="openId === c.id"
                          [attr.aria-controls]="'case-panel-' + c.id"
                          [style.--i]="i"
                          (click)="activateCase(c)"
                        >
                          <span class="archive-mark" aria-hidden="true">
                            <app-icon [name]="stageIcon(c)" [size]="16" />
                          </span>
                          <div class="archive-who">
                            <strong>{{ productName(c) }} #{{ c.id }}</strong>
                            <span>{{ cityLine(c) }}</span>
                          </div>
                          <div class="archive-stage">
                            <span>{{ stageProse(c) }}</span>
                            <span class="archive-pay tabular">
                              {{ c.paid ? 'Pagado' : 'Por pagar' }} · {{ money(c.amount_cents) }}
                            </span>
                          </div>
                          <span class="archive-go">
                            {{ goLabel(c) }}
                            <app-icon name="arrow-right" [size]="14" />
                          </span>
                        </button>

                        @if (openId === c.id) {
                          <div class="desk-shell" [attr.id]="'case-panel-' + c.id">
                            <app-client-divorcio-desk
                              [product]="product"
                              [caseItem]="c"
                              [step]="deskStep"
                              [embedded]="true"
                              (goStep)="selectDeskStep($event)"
                              (caseChanged)="onDeskCaseChanged($event)"
                            />
                          </div>
                        }
                      </li>
                    }
                  </ul>
                </section>
              }

              @if (deskCase && !openCaseInView) {
                <div class="desk-shell is-loose">
                  <app-client-divorcio-desk
                    [product]="product"
                    [caseItem]="deskCase"
                    [step]="deskStep"
                    (goStep)="selectDeskStep($event)"
                    (caseChanged)="onDeskCaseChanged($event)"
                  />
                </div>
              }
            }
          </div>
        }
      </div>
    </div>
  `,
  styles: [`
    :host {
      display: block;
      min-height: calc(100dvh - var(--header-height));
    }

    .client-workspace {
      display: grid;
      grid-template-columns: 272px minmax(0, 1fr);
      min-height: calc(100dvh - var(--header-height));
      background: var(--bg);
    }

    .client-sidebar {
      position: sticky;
      top: var(--header-height);
      align-self: start;
      z-index: 2;
      display: flex;
      flex-direction: column;
      gap: var(--space-5);
      width: 272px;
      min-height: calc(100dvh - var(--header-height));
      padding: var(--space-6) var(--space-5) var(--space-7);
      background:
        linear-gradient(
          180deg,
          color-mix(in srgb, var(--bg) 88%, var(--primary-subtle)),
          var(--bg-subtle) 48%
        );
      border-right: 1px solid color-mix(in srgb, var(--primary) 10%, var(--border));
      animation: side-in 480ms var(--ease-out) both;
    }

    .side-block {
      display: grid;
      gap: var(--space-2);
    }

    .side-block--soon {
      margin-top: auto;
      padding-top: var(--space-4);
      border-top: 1px solid color-mix(in srgb, var(--primary) 10%, var(--border));
    }

    .side-label {
      margin: 0;
      font-size: 0.68rem;
      font-weight: 650;
      letter-spacing: 0.08em;
      text-transform: uppercase;
      color: var(--text-muted);
    }

    .side-nav {
      display: grid;
      gap: 0.35rem;
    }

    .side-service {
      display: grid;
      gap: 0.2rem;
    }

    .side-timeline {
      list-style: none;
      margin: 0.15rem 0 0.35rem;
      padding: 0 0 0 0.85rem;
      display: grid;
      gap: 0;
      animation: side-in 420ms var(--ease-out) both;
    }

    .side-step {
      display: grid;
      grid-template-columns: 1rem minmax(0, 1fr);
      align-items: center;
      gap: 0.55rem;
      width: 100%;
      padding: 0.35rem 0.4rem 0.35rem 0;
      border: 0;
      background: transparent;
      color: var(--text-muted);
      font: inherit;
      font-size: 0.78rem;
      font-weight: 600;
      text-align: left;
      cursor: pointer;
      position: relative;
      transition: color 180ms var(--ease-out);
    }

    .side-step-rail {
      display: grid;
      place-items: center;
      position: relative;
      height: 100%;
      min-height: 1.5rem;
    }

    .side-step-rail::before {
      content: '';
      position: absolute;
      top: -0.35rem;
      bottom: -0.35rem;
      left: 50%;
      width: 1px;
      transform: translateX(-50%);
      background: color-mix(in srgb, var(--primary) 22%, var(--border));
    }

    .side-timeline li:first-child .side-step-rail::before { top: 50%; }
    .side-timeline li:last-child .side-step-rail::before { bottom: 50%; }

    .side-step-dot {
      position: relative;
      z-index: 1;
      display: grid;
      place-items: center;
      width: 0.7rem;
      height: 0.7rem;
      border-radius: 999px;
      border: 1.5px solid color-mix(in srgb, var(--primary) 30%, var(--border));
      background: var(--bg-subtle);
      color: var(--primary);
    }

    .side-step.done .side-step-dot {
      background: var(--primary);
      border-color: var(--primary);
      color: #fff;
    }

    .side-step.current .side-step-dot,
    .side-step.on .side-step-dot {
      border-color: var(--primary);
      box-shadow: 0 0 0 3px color-mix(in srgb, var(--primary) 18%, transparent);
    }

    .side-step.on,
    .side-step.current {
      color: var(--primary);
    }

    .side-step.done { color: var(--text-secondary); }
    .side-step.locked { opacity: 0.45; cursor: default; }
    .side-step:hover:not(.locked):not(.on) { color: var(--text); }
    .side-step:focus-visible {
      outline: 2px solid var(--focus-ring);
      outline-offset: 2px;
      border-radius: var(--radius-sm);
    }

    .side-item {
      display: grid;
      grid-template-columns: minmax(0, 1fr) auto;
      align-items: start;
      gap: var(--space-2);
      width: 100%;
      padding: 0.7rem 0.75rem;
      border: 1px solid transparent;
      border-radius: var(--radius-md);
      background: transparent;
      text-align: left;
      color: var(--text);
      font: inherit;
      cursor: pointer;
      transition:
        background 200ms var(--ease-out),
        border-color 200ms var(--ease-out),
        transform 220ms var(--ease-out);
    }

    .side-item-copy {
      display: grid;
      gap: 0.15rem;
      min-width: 0;
    }

    .side-item-name {
      font-size: var(--text-sm);
      font-weight: 650;
      letter-spacing: -0.02em;
      line-height: 1.25;
      color: var(--text);
    }

    .side-item-desc {
      font-size: 0.72rem;
      line-height: 1.35;
      color: var(--text-muted);
    }

    .side-count {
      font-size: var(--text-xs);
      font-weight: 650;
      color: var(--text-muted);
      padding-top: 0.15rem;
    }

    .side-item:hover:not(.on) {
      background: color-mix(in srgb, var(--surface) 70%, transparent);
      border-color: color-mix(in srgb, var(--primary) 14%, var(--border));
    }

    .side-item.on {
      background: var(--surface);
      border-color: color-mix(in srgb, var(--primary) 28%, var(--border));
      box-shadow: var(--shadow-sm);
    }

    .side-item.on .side-item-name {
      color: var(--primary);
    }

    .side-item.on .side-count {
      color: var(--primary);
    }

    .side-item:focus-visible {
      outline: 2px solid var(--focus-ring);
      outline-offset: 2px;
    }

    .side-item:active {
      transform: scale(0.985);
    }

    .side-soon-list {
      list-style: none;
      margin: 0;
      padding: 0;
      display: grid;
      gap: 0.35rem;
    }

    .side-soon-list li {
      font-size: var(--text-xs);
      color: var(--text-muted);
      line-height: 1.3;
    }

    .client-main {
      min-width: 0;
      padding: var(--space-6) var(--container-pad) var(--space-8);
      animation: main-in 360ms var(--ease-out) both;
    }

    /* La lista dejó de ser una columna angosta pegada a un caso: las tarjetas van de a dos
       y la del expediente abierto lleva el trámite adentro. Todas miden lo mismo de ancho:
       sin flex-grow, la que cae sola en una línea impar no se estira; queda en su columna,
       alineada con las de arriba, y el lugar que no ocupa queda libre. */
    .inbox-cases {
      display: grid;
      gap: var(--space-5);
    }

    .dossier-grid {
      display: flex;
      flex-wrap: wrap;
      gap: var(--space-3);
      margin-bottom: var(--space-6);
      container-type: inline-size;
    }

    .dossier-cell {
      flex: 0 1 calc(50% - var(--space-3) / 2);
      min-width: 0;
    }

    /* Todas del mismo tamaño: sin esto la tarjeta cuya pista ocupa dos líneas queda más
       alta que las de la otra fila y se leen como tamaños distintos. */
    .dossier-cell:not(.is-open) .dossier { min-height: 12.5rem; }

    /* La pista reserva siempre dos líneas en las tarjetas de la lista. El min-height es un
       piso, no un techo: con la pista de una línea al lado de una de dos, la primera queda
       más baja. Reservar el alto las iguala sin recortar el texto. */
    .dossier-cell:not(.is-open) .dossier-hint { min-height: 2lh; }

    /* En la tarjeta de la lista la línea de pasos cruza el ancho del cuerpo, con las
       especificaciones debajo: antes quedaba pegada a la izquierda con aire al lado. */
    .dossier-cell:not(.is-open) .dossier-track { max-width: none; }

    @media (max-width: 1100px) {
      .dossier-cell { flex-basis: 100%; }
    }

    /* El expediente abierto es una sola tarjeta: la cabecera arriba con el estado al
       extremo derecho, la línea, y el trámite debajo. El borde tintado es su única señal:
       las tarjetas ya traen su elevación, y sumarle otra sería declararla dos veces. */
    .dossier-cell.is-open {
      flex-basis: 100%;
      padding: clamp(1.25rem, 2vw, 1.75rem);
      border: 1px solid color-mix(in srgb, var(--primary) 30%, var(--border));
      border-radius: var(--radius-xl);
      background: var(--surface);
    }

    .dossier-cell.is-open .dossier,
    .dossier-cell.is-open .archive-row {
      padding: 0 0 var(--space-4);
      border: 0;
      border-bottom: 1px solid var(--border);
      border-radius: 0;
      background: none;
      box-shadow: none;
    }

    /* El contenedor de consulta es el envoltorio que define el ancho, no el componente:
       así el desk responde al espacio que le toca en cada contexto. */
    .desk-shell {
      min-width: 0;
      container-type: inline-size;
    }

    .dossier-cell.is-open .desk-shell,
    .inbox-cases .desk-shell.is-loose {
      margin-top: var(--space-4);
    }

    .inbox-head {
      margin-bottom: var(--space-5);
    }

    .inbox-head h1 {
      margin: 0;
      font-family: var(--font-display);
      font-size: clamp(1.85rem, 3vw, 2.5rem);
      font-weight: 600;
      letter-spacing: -0.03em;
      line-height: 1.1;
    }

    .inbox-lede {
      margin: var(--space-2) 0 0;
      max-width: 42ch;
      color: var(--text-secondary);
      font-size: var(--text-sm);
    }

    .seg {
      display: flex;
      flex-wrap: wrap;
      gap: 0.35rem;
      margin-bottom: var(--space-5);
      padding: 0.25rem;
      width: fit-content;
      max-width: 100%;
      background: var(--bg-subtle);
      border: 1px solid var(--border);
      border-radius: var(--radius-md);
      animation: inbox-in 480ms var(--ease-out) both;
      animation-delay: 60ms;
    }

    .seg-btn {
      display: inline-flex;
      align-items: center;
      gap: 0.4rem;
      min-height: 2rem;
      padding: 0 0.75rem;
      border: 0;
      border-radius: calc(var(--radius-md) - 2px);
      background: transparent;
      color: var(--text-secondary);
      font-size: var(--text-sm);
      font-weight: 600;
      transition:
        background 180ms var(--ease-out),
        color 180ms var(--ease-out);
    }

    .seg-btn:hover:not(.on) {
      color: var(--text);
      background: color-mix(in srgb, var(--surface) 80%, transparent);
    }

    .seg-btn.on {
      background: var(--surface);
      color: var(--primary);
      box-shadow: var(--shadow-sm);
    }

    .seg-n {
      font-size: var(--text-xs);
      font-weight: 650;
      color: var(--text-muted);
    }

    .seg-btn.on .seg-n { color: var(--primary); }

    .dossier-stack {
      display: grid;
      gap: var(--space-3);
      margin-bottom: var(--space-6);
    }

    /* Es un <button>, y el estilo del navegador para los controles centra su contenido:
       con display:grid eso se aplica como justify-content:center sobre la columna, que
       quedaba flotando en el medio con ~345px muertos por lado (la columna solo mide los
       52ch del hint). justify-items:start no lo evita porque alinea los items DENTRO de
       la columna. justify-content:stretch lo devuelve al borde del padding. */
    .dossier {
      display: grid;
      grid-template-columns: minmax(0, 1fr) auto;
      align-items: center;
      justify-content: stretch;
      column-gap: var(--space-5);
      row-gap: var(--space-2);
      width: 100%;
      padding: clamp(1.25rem, 3vw, 1.75rem);
      text-decoration: none;
      text-align: left;
      font: inherit;
      cursor: pointer;
      color: inherit;
      background:
        linear-gradient(
          180deg,
          color-mix(in srgb, var(--bg) 70%, var(--surface)),
          var(--surface) 42%
        );
      border: 1px solid color-mix(in srgb, var(--primary) 14%, var(--border));
      border-radius: var(--radius-lg);
      box-shadow:
        inset 0 1px 0 color-mix(in srgb, var(--bg) 80%, transparent),
        var(--shadow-md);
      animation: inbox-row-in 560ms var(--ease-out) both;
      animation-delay: calc(min(var(--i, 0), 6) * 50ms);
      transition:
        transform 280ms var(--ease-out),
        box-shadow 280ms var(--ease-out),
        border-color 200ms var(--ease);
    }

    .dossier-body {
      display: grid;
      gap: var(--space-2);
      justify-items: start;
      min-width: 0;
    }

    /* La fila de datos del abierto, entre el nombre y la línea de pasos. Ocupa el ancho del
       cuerpo (que es un grid con justify-items: start, así que hay que estirarla) y reparte
       los pares; cuando el contenedor es angosto se envuelve y va pegada a la izquierda. */
    .dossier-facts {
      display: flex;
      flex-wrap: wrap;
      justify-self: stretch;
      gap: var(--space-2) var(--space-6);
      margin: var(--space-1) 0 0;
    }

    .dossier-fact {
      display: flex;
      align-items: baseline;
      gap: var(--space-2);
      min-width: 0;
    }

    .dossier-fact dt {
      color: var(--text-muted);
      font-size: var(--text-xs);
    }

    .dossier-fact dd {
      margin: 0;
      color: var(--text);
      font-size: var(--text-sm);
      font-weight: 600;
    }

    @container (min-width: 34rem) {
      .dossier-facts { justify-content: space-between; }
    }

    .dossier:hover {
      transform: translateY(-2px);
      box-shadow:
        inset 0 1px 0 color-mix(in srgb, var(--bg) 80%, transparent),
        var(--shadow-lg);
      border-color: color-mix(in srgb, var(--primary) 36%, var(--border));
    }

    .dossier.is-pay {
      border-color: color-mix(in srgb, var(--warning) 40%, var(--border));
      background:
        linear-gradient(180deg, color-mix(in srgb, var(--warning-subtle) 70%, transparent), transparent 45%),
        var(--surface);
    }

    .dossier-title {
      margin: 0;
      font-family: var(--font-sans);
      font-size: clamp(1.35rem, 2.4vw, 1.75rem);
      font-weight: 650;
      letter-spacing: -0.03em;
      line-height: 1.15;
      color: var(--text);
    }

    .dossier-id {
      margin: 0;
      font-size: var(--text-sm);
      color: var(--text-secondary);
    }

    .dossier-hint {
      margin: var(--space-1) 0 0;
      max-width: 52ch;
      font-size: var(--text-sm);
      line-height: var(--leading-normal);
      color: var(--text);
    }

    /* Avance del trámite en la tarjeta: cinco segmentos, uno por paso, con el estado real
       que ya calcula el desk. El ancho es explícito porque el cuerpo de la tarjeta no
       estira a sus hijos: sin él, los segmentos caían a 0px. */
    .dossier-track {
      display: grid;
      grid-auto-flow: column;
      grid-auto-columns: minmax(0, 1fr);
      gap: 4px;
      width: 100%;
      max-width: 22rem;
      margin-top: var(--space-3);
    }

    .dossier-track i {
      height: 4px;
      border-radius: 999px;
      background: color-mix(in srgb, var(--border) 70%, transparent);
    }

    .dossier-track i.is-upcoming { background: var(--border); }
    .dossier-track i.is-current { background: color-mix(in srgb, var(--primary) 45%, var(--border)); }
    .dossier-track i.is-done { background: var(--primary); }

    .dossier-meta {
      margin: 0;
      font-size: var(--text-xs);
      font-weight: 600;
      color: var(--text-muted);
    }

    .dossier-cta {
      justify-self: end;
      align-self: center;
      pointer-events: none;
    }

    .archive {
      display: grid;
      gap: var(--space-3);
    }

    .archive-head {
      margin: 0;
      font-family: var(--font-sans);
      font-size: var(--text-base);
      font-weight: 650;
      letter-spacing: -0.02em;
      color: var(--text-secondary);
    }

    .archive-list {
      list-style: none;
      margin: 0;
      padding: 0;
      display: grid;
      gap: var(--space-2);
    }

    .archive-row {
      display: grid;
      grid-template-columns: auto minmax(0, 1.2fr) minmax(0, 1fr) auto;
      gap: var(--space-3);
      align-items: center;
      width: 100%;
      padding: var(--space-3) var(--space-4);
      text-decoration: none;
      text-align: left;
      font: inherit;
      cursor: pointer;
      color: inherit;
      background: var(--surface);
      border: 1px solid var(--border);
      border-radius: var(--radius-md);
      box-shadow: var(--shadow-sm);
      animation: inbox-row-in 480ms var(--ease-out) both;
      animation-delay: calc(min(var(--i, 0), 8) * 40ms);
      transition:
        border-color 200ms var(--ease),
        box-shadow 240ms var(--ease-out),
        transform 240ms var(--ease-out);
    }

    .archive-row:hover {
      border-color: color-mix(in srgb, var(--primary) 28%, var(--border));
      box-shadow: var(--shadow-md);
      transform: translateY(-1px);
    }

    .archive-row:hover .archive-go { color: var(--primary); }

    .archive-mark {
      display: grid;
      place-items: center;
      width: 2rem;
      height: 2rem;
      border-radius: var(--radius-sm);
      background: var(--bg-subtle);
      color: var(--text-muted);
      border: 1px solid var(--border);
    }

    .archive-who {
      display: grid;
      gap: 0.1rem;
      min-width: 0;
    }

    .archive-who strong {
      font-size: var(--text-sm);
      font-weight: 650;
      letter-spacing: -0.02em;
    }

    .archive-who span {
      font-size: var(--text-xs);
      color: var(--text-secondary);
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }

    .archive-stage {
      display: grid;
      gap: 0.1rem;
      min-width: 0;
      font-size: var(--text-xs);
      color: var(--text-secondary);
    }

    .archive-pay {
      font-weight: 600;
      color: var(--text-muted);
    }

    .archive-go {
      display: inline-flex;
      align-items: center;
      gap: var(--space-1);
      font-size: var(--text-sm);
      font-weight: 650;
      color: var(--text-secondary);
      white-space: nowrap;
      transition: color 200ms var(--ease);
    }

    .state-loading {
      display: flex;
      align-items: center;
      gap: var(--space-3);
      color: var(--text-secondary);
      font-size: var(--text-sm);
    }

    .state-error {
      display: flex;
      align-items: flex-start;
      gap: var(--space-3);
      flex-wrap: wrap;
      border-color: var(--danger-border);
      background: var(--danger-subtle);
    }

    .state-error-icon { color: var(--danger); display: grid; place-items: center; }
    .state-error-body { flex: 1; min-width: 14rem; }
    .state-error-body strong { display: block; font-weight: 650; }
    .state-error-body p {
      margin: var(--space-1) 0 0;
      font-size: var(--text-sm);
      color: var(--text-secondary);
    }

    .empty-state {
      display: grid;
      justify-items: center;
      gap: var(--space-3);
      text-align: center;
      padding: var(--space-7) var(--space-5);
      animation: inbox-in 480ms var(--ease-out) both;
    }

    .empty-icon {
      display: grid;
      place-items: center;
      width: 48px;
      height: 48px;
      border-radius: var(--radius-md);
      background: var(--bg-subtle);
      border: 1px solid var(--border);
      color: var(--text-muted);
    }

    .empty-state h2 { font-size: var(--text-lg); margin: 0; }
    .empty-state p {
      margin: 0;
      max-width: 48ch;
      color: var(--text-secondary);
      font-size: var(--text-sm);
    }

    @keyframes side-in {
      from {
        opacity: 0;
        transform: translateX(-12px);
      }
      to {
        opacity: 1;
        transform: none;
      }
    }

    @keyframes main-in {
      from {
        opacity: 0;
        transform: translateY(12px);
      }
      to {
        opacity: 1;
        transform: none;
      }
    }

    @keyframes inbox-in {
      from {
        opacity: 0;
        transform: translateY(14px);
        filter: blur(6px);
      }
      to {
        opacity: 1;
        transform: none;
        filter: blur(0);
      }
    }

    @keyframes inbox-row-in {
      from {
        opacity: 0;
        transform: translateY(18px);
        filter: blur(8px);
      }
      to {
        opacity: 1;
        transform: none;
        filter: blur(0);
      }
    }

    @media (max-width: 860px) {
      .client-workspace {
        grid-template-columns: 1fr;
        min-height: 0;
      }

      .client-sidebar {
        position: static;
        width: auto;
        min-height: 0;
        gap: var(--space-4);
        border-right: 0;
        border-bottom: 1px solid color-mix(in srgb, var(--primary) 10%, var(--border));
        padding: var(--space-5) var(--container-pad);
        animation: main-in 360ms var(--ease-out) both;
      }

      .side-block--soon {
        margin-top: 0;
      }

      .side-soon-list {
        display: flex;
        flex-wrap: wrap;
        gap: 0.35rem 0.85rem;
      }

      .client-main {
        padding-inline: var(--container-pad);
      }
    }

    /* Igual la fila del archivo. */
    .archive {
      container-type: inline-size;
    }

    @container (max-width: 34rem) {
      .dossier {
        grid-template-columns: 1fr;
      }

      .dossier-cta {
        width: 100%;
        justify-content: center;
        margin-top: var(--space-3);
      }

      .archive-row {
        grid-template-columns: auto minmax(0, 1fr) auto;
        grid-template-areas:
          "mark who go"
          "stage stage stage";
      }
      .archive-mark { grid-area: mark; }
      .archive-who { grid-area: who; }
      .archive-stage { grid-area: stage; }
      .archive-go { grid-area: go; }
    }
  `],
})
export class ClientPanelComponent implements OnInit {
  cases: CaseItem[] = [];
  filter: Filter = 'action';
  product = 'all';
  deskStep: ProductDeskStepId = 'pay';
  deskCaseId: number | null = null;
  loading = false;
  error = false;
  readonly catalogServices = LEGALSTATION_CATALOG;
  readonly productSideDesc = productSideDesc;
  filterDefs: { id: Filter; label: string }[] = [
    { id: 'action', label: 'Te toca' },
    { id: 'open', label: 'En curso' },
    { id: 'done', label: 'Cerrados' },
    { id: 'all', label: 'Todos' },
  ];

  constructor(private api: ApiService, private router: Router) {}

  ngOnInit(): void {
    this.load();
  }

  get liveServices(): ProductCatalogEntry[] {
    return this.catalogServices.filter((s) => s.live);
  }

  get soonServices(): ProductCatalogEntry[] {
    return this.catalogServices.filter((s) => !s.live);
  }

  isDeskProduct(id: string): boolean {
    return isTimelineProduct(id);
  }

  get openCaseId(): number | null {
    return this.deskCase?.id ?? null;
  }

  /* El desk vive dentro de la tarjeta abierta. Si el recorte de filtros la dejó fuera de
     las dos listas, se renderiza suelto para no perder el trámite de vista. */
  get openCaseInView(): boolean {
    const id = this.openCaseId;
    if (id == null) return false;
    return this.actionInView.some((c) => c.id === id) || this.archiveInView.some((c) => c.id === id);
  }

  /* Datos del expediente que llenan la cabecera del abierto, entre el nombre y la línea de
     pasos: con un solo trámite el ancho sobraba y el medio quedaba vacío. Son los mismos
     cuatro que antes vivían en el bloque Expediente de la ficha, así que no se dicen dos
     veces. */
  caseFacts(c: CaseItem): { label: string; value: string }[] {
    return [
      { label: 'Abierto el', value: formatDateLong(c.created_at) || 'Sin fecha' },
      { label: 'Minuta', value: c.has_minuta ? 'Lista' : 'En preparación' },
      { label: 'Notaría', value: (c.notary_name || '').trim() || 'Por definir' },
      { label: 'Comparecencia', value: formatDateLong(c.appointment_at) || 'Por agendar' },
    ];
  }

  /* Resumen de la tarjeta de la lista, debajo de la línea de pasos: el estado del paso de
     documentos, que es lo que hace falta para decidir si se entra, y la fecha de apertura.
     Solo lo llevan las tarjetas; el expediente abierto ya tiene sus cuatro datos arriba. */
  tileSpecs(c: CaseItem): { label: string; value: string }[] {
    const docs = this.productSteps(c).find((s) => s.id === 'docs');
    const value = docs?.state === 'done' ? 'Listo' : docs?.state === 'current' ? 'En curso' : 'Pendiente';
    return [
      { label: 'Documentos', value },
      { label: 'Abierto el', value: formatDateShort(c.created_at) || 'Sin fecha' },
    ];
  }

  deskCaseFor(productId: string): CaseItem | null {
    if (this.product === productId && this.deskCaseId != null) {
      const pinned = this.cases.find(
        (c) => c.id === this.deskCaseId && normalizeProductId(c.product) === productId,
      );
      if (pinned) return pinned;
    }
    return pickProductCase(this.cases, productId);
  }

  get deskCase(): CaseItem | null {
    if (!this.isDeskProduct(this.product)) return null;
    return this.deskCaseFor(this.product);
  }

  get deskTimeline() {
    return buildProductSteps(this.deskCase, this.product);
  }

  /** @deprecated alias for specs */
  get divorcioCase(): CaseItem | null {
    return this.deskCaseFor('divorcio360');
  }

  get divorcioTimeline() {
    return buildProductSteps(this.divorcioCase, 'divorcio360');
  }

  get divorcioStep(): ProductDeskStepId {
    return this.product === 'divorcio360' ? this.deskStep : currentProductStep(this.divorcioCase, 'divorcio360');
  }

  setFilter(id: Filter): void {
    this.filter = id;
  }

  setProduct(id: string): void {
    if (id !== 'all') {
      const entry = this.catalogServices.find((s) => s.id === id);
      if (entry && !entry.live) return;
      setActiveProduct(id);
    }
    this.product = id;
    if (this.isDeskProduct(id)) {
      const c = this.deskCaseFor(id);
      this.deskCaseId = c?.id ?? null;
      this.deskStep = currentProductStep(c, id);
    }
  }

  selectDeskStep(id: ProductDeskStepId): void {
    const step = this.deskTimeline.find((s) => s.id === id);
    if (step?.state === 'locked' && this.deskCase) return;
    this.deskStep = id;
  }

  /** @deprecated */
  selectDivorcioStep(id: ProductDeskStepId): void {
    this.selectDeskStep(id);
  }

  openDesk(c: CaseItem): void {
    const product = normalizeProductId(c.product);
    if (!this.isDeskProduct(product)) return;
    setActiveProduct(product);
    this.product = product;
    this.deskCaseId = c.id;
    this.deskStep = currentProductStep(c, product);
  }

  openDivorcio(c: CaseItem): void {
    this.openDesk(c);
  }

  onDeskCaseChanged(c: CaseItem): void {
    const idx = this.cases.findIndex((x) => x.id === c.id);
    if (idx >= 0) this.cases[idx] = { ...this.cases[idx], ...c };
    else this.cases = [c, ...this.cases];
    this.deskCaseId = c.id;
    const product = normalizeProductId(c.product || this.product);
    const next = currentProductStep(c, product);
    if (this.deskTimeline.find((s) => s.id === this.deskStep)?.state === 'done') {
      this.deskStep = next;
    }
  }

  onDivorcioCaseChanged(c: CaseItem): void {
    this.onDeskCaseChanged(c);
  }

  isDivorcio(c: CaseItem): boolean {
    return normalizeProductId(c.product) === 'divorcio360';
  }

  isDeskCase(c: CaseItem): boolean {
    return this.isDeskProduct(normalizeProductId(c.product));
  }

  activateCase(c: CaseItem): void {
    if (this.isDeskCase(c)) {
      this.openDesk(c);
      return;
    }
    this.openCase(c);
    void this.router.navigate(this.rowLink(c));
  }

  clearFilters(): void {
    this.filter = 'all';
    this.product = 'all';
  }

  get selectedServiceName(): string {
    if (this.product === 'all') return 'tu cuenta';
    return getProductDisplayName(this.product);
  }

  get startPath(): string {
    return getProductQuestionnairePath(this.product === 'all' ? 'divorcio360' : this.product);
  }

  get pageTitle(): string {
    if (this.product === 'all') return 'Tus trámites';
    return this.selectedServiceName;
  }

  load(): void {
    this.loading = true;
    this.error = false;
    this.api.listCases().subscribe({
      next: (c) => {
        this.cases = c;
        this.loading = false;
        if (this.filter === 'action' && this.countFor('action') === 0) {
          this.filter = 'all';
        }
        if (this.isDeskProduct(this.product)) {
          const active = this.deskCase;
          this.deskCaseId = active?.id ?? null;
          if (!this.deskTimeline.some((s) => s.id === this.deskStep)) {
            this.deskStep = currentProductStep(active, this.product);
          }
        }
      },
      error: () => {
        this.error = true;
        this.loading = false;
      },
    });
  }

  get filtered(): CaseItem[] {
    const list = this.cases.filter((c) => this.matches(c, this.filter) && this.matchesProduct(c, this.product));
    return [...list].sort((a, b) => {
      const act = Number(this.needsYou(b)) - Number(this.needsYou(a));
      if (act) return act;
      const pay = Number(!a.paid) - Number(!b.paid);
      if (pay) return pay;
      return b.id - a.id;
    });
  }

  get actionInView(): CaseItem[] {
    return this.filtered
      .filter((c) => this.needsYou(c))
      .sort((a, b) => caseUrgency(b) - caseUrgency(a) || b.id - a.id);
  }

  get archiveInView(): CaseItem[] {
    return this.filtered.filter((c) => !this.needsYou(c));
  }

  get pageLede(): string {
    if (this.loading || this.error) {
      return 'Qué te toca ahora. Un clic continúa.';
    }
    if (this.isDeskProduct(this.product)) {
      if (!this.deskCase) {
        return this.product === 'traslado360'
          ? 'Un expediente de traslado. Elige un paso en la barra o inicia el trámite.'
          : 'Un solo expediente de mutuo acuerdo. Elige un paso en la barra o inicia la evaluación.';
      }
      return 'Mismo panel, un paso a la vez. La línea de pasos de la izquierda marca dónde vas.';
    }
    if (this.product !== 'all' && this.countProductTotal(this.product) === 0) {
      return `Aún no tienes trámites de ${this.selectedServiceName}. Puedes iniciar uno cuando quieras.`;
    }
    if (!this.cases.length) {
      return 'Elige un servicio e inicia tu primer expediente.';
    }
    if (this.cases.some((c) => this.needsYou(c) && this.matchesProduct(c, this.product))) {
      return 'Qué te toca ahora. Un clic continúa.';
    }
    return 'Nada pendiente. El resto está en archivo.';
  }

  get archiveHeading(): string {
    switch (this.filter) {
      case 'open': return 'En curso';
      case 'done': return 'Cerrados';
      case 'action': return 'Archivo';
      default: return this.actionInView.length ? 'Archivo' : 'Todos';
    }
  }

  get filterLabel(): string {
    const lane = this.filterDefs.find((f) => f.id === this.filter)?.label ?? 'Todos';
    if (this.product === 'all') return lane;
    return `${lane} · ${getProductDisplayName(this.product)}`;
  }

  trackKey(c: CaseItem): string {
    return `${this.filter}-${this.product}-${c.id}`;
  }

  needsYou(c: CaseItem): boolean {
    return !c.paid || c.status === '02' || !!c.can_sign || c.status === '05';
  }

  dossierTitle(c: CaseItem): string {
    if (!c.paid) return 'Completa el pago';
    if (c.can_sign) return 'Firma tu minuta';
    if (c.status === '02') return 'Sube tus documentos';
    return caseShort(c.status, 'Abre el expediente');
  }

  nextHint(c: CaseItem): string {
    if (!c.paid) return 'Completa el pago para continuar.';
    if (c.can_sign) return c.sign_hint || 'Firma la minuta.';
    return caseClientHint(c.status);
  }

  stageProse(c: CaseItem): string {
    const n = parseInt(c.status, 10);
    const label = caseShort(c.status, c.status_label);
    if (!Number.isFinite(n)) return label;
    return `Etapa ${n}: ${label}`;
  }

  metaLine(c: CaseItem): string {
    const pay = c.paid ? 'Pagado' : 'Por pagar';
    return `${pay} · ${this.money(c.amount_cents)} · ${this.stageProse(c)}`;
  }

  stageIcon(c: CaseItem): IconName {
    if (!c.paid) return 'credit-card';
    if (c.can_sign) return 'signature';
    return CASE_STATUS_ICONS[c.status] || 'inbox';
  }

  productSteps(c: CaseItem) {
    return buildProductSteps(c, normalizeProductId(c.product || this.product));
  }

  trackLabel(c: CaseItem): string {
    const steps = this.productSteps(c);
    const current = steps.findIndex((s) => s.state === 'current');
    const done = steps.filter((s) => s.state === 'done').length;
    const index = current >= 0 ? current + 1 : Math.max(done, 1);
    const name = current >= 0 ? steps[current].label : steps[Math.max(done - 1, 0)].label;
    return `Paso ${index} de ${steps.length}: ${name}`;
  }

  productName(c: CaseItem): string {
    return getProductDisplayName(c.product || 'divorcio360');
  }

  cityLine(c: CaseItem): string {
    const raw = (c.city || '').trim();
    if (!raw) return 'Sin ciudad';
    return raw.split(',')[0].trim();
  }

  money(cents: number): string {
    return `$${Math.round((cents || 0) / 100)}`;
  }

  goLabel(c: CaseItem): string {
    if (!c.paid) return 'Pagar';
    if (c.can_sign) return 'Firmar';
    if (c.status === '02') return 'Subir';
    return 'Abrir';
  }

  /** Sync shell branding before shared /upload|/firma|/checkout routes (no product slug in URL). */
  openCase(c: CaseItem): void {
    setActiveProduct(normalizeProductId(c.product));
  }

  rowLink(c: CaseItem): (string | number)[] {
    if (!c.paid) return ['/checkout', c.id];
    if (c.can_sign) return ['/firma', c.id];
    if (c.status === '02') return ['/upload', c.id];
    return ['/caso', c.id];
  }

  countFor(id: Filter): number {
    return this.cases.filter((c) => this.matches(c, id) && this.matchesProduct(c, this.product)).length;
  }

  /** Conteos del sidebar: estables al cambiar Te toca / En curso. */
  countProductTotal(id: string): number {
    return this.cases.filter((c) => this.matchesProduct(c, id)).length;
  }

  private matches(c: CaseItem, id: Filter): boolean {
    switch (id) {
      case 'action': return this.needsYou(c);
      case 'open': return c.status !== '10';
      case 'done': return c.status === '10';
      default: return true;
    }
  }

  private matchesProduct(c: CaseItem, id: string): boolean {
    if (id === 'all') return true;
    return normalizeProductId(c.product) === id;
  }
}
