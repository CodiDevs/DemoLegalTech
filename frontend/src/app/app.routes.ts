import { Routes } from '@angular/router';
import { ShellComponent } from './layout/shell.component';
import { authGuard, roleGuard, clienteOrGuestGuard } from './core/guards';

export const routes: Routes = [
  {
    path: '',
    component: ShellComponent,
    children: [
      {
        path: '',
        loadComponent: () =>
          import('./pages/saas/saas-landing.component').then((m) => m.SaasLandingComponent),
      },
      {
        path: 'productos/divorcio360',
        loadComponent: () =>
          import('./pages/saas/divorcio-landing.component').then((m) => m.DivorcioLandingComponent),
      },
      {
        path: 'productos/:slug',
        loadComponent: () =>
          import('./pages/product-site/product-landing.component').then((m) => m.ProductLandingComponent),
      },
      {
        path: 'productos/:slug/cuestionario',
        loadComponent: () =>
          import('./pages/product-site/product-questionnaire.component').then(
            (m) => m.ProductQuestionnaireComponent,
          ),
        canActivate: [clienteOrGuestGuard],
      },
      {
        path: 'productos/:slug/expediente',
        loadComponent: () =>
          import('./pages/client-panel/product-expediente.component').then(
            (m) => m.ProductExpedienteComponent,
          ),
        canActivate: [roleGuard('cliente')],
      },
      { path: 'intake/traslado360', redirectTo: 'productos/traslado360/cuestionario', pathMatch: 'full' },
      { path: 'intake/bienraiz360', redirectTo: 'productos/bienraiz360/cuestionario', pathMatch: 'full' },
      {
        path: 'cuestionario',
        loadComponent: () =>
          import('./pages/questionnaire/questionnaire.component').then((m) => m.QuestionnaireComponent),
        canActivate: [clienteOrGuestGuard],
      },
      {
        path: 'auth',
        loadComponent: () => import('./pages/auth/auth.component').then((m) => m.AuthComponent),
      },
      {
        path: 'legal/privacidad',
        loadComponent: () =>
          import('./pages/legal/legal-page.component').then((m) => m.LegalPageComponent),
        data: { legalDocument: 'privacy' },
      },
      {
        path: 'legal/terminos',
        loadComponent: () =>
          import('./pages/legal/legal-page.component').then((m) => m.LegalPageComponent),
        data: { legalDocument: 'terms' },
      },
      {
        path: 'cliente',
        loadComponent: () =>
          import('./pages/client-panel/client-panel.component').then((m) => m.ClientPanelComponent),
        canActivate: [roleGuard('cliente')],
      },
      {
        path: 'abogado',
        loadComponent: () =>
          import('./pages/lawyer-panel/lawyer-shell.component').then((m) => m.LawyerShellComponent),
        canActivate: [roleGuard('abogado')],
        children: [
          {
            path: '',
            loadComponent: () =>
              import('./pages/lawyer-panel/lawyer-panel.component').then((m) => m.LawyerPanelComponent),
          },
          {
            path: 'caso/:id',
            loadComponent: () =>
              import('./pages/lawyer-case/lawyer-case.component').then((m) => m.LawyerCaseComponent),
          },
          { path: 'fase2', redirectTo: 'fase2/admin', pathMatch: 'full' },
          {
            path: 'fase2/admin',
            loadComponent: () =>
              import('./pages/fase2/admin/admin.component').then((m) => m.Fase2AdminComponent),
          },
          {
            path: 'fase2/templates',
            loadComponent: () =>
              import('./pages/fase2/templates/templates.component').then((m) => m.Fase2TemplatesComponent),
          },
          {
            path: 'fase2/ai',
            loadComponent: () =>
              import('./pages/fase2/ai-agent/ai-agent.component').then((m) => m.Fase2AiComponent),
          },
          {
            path: 'fase2/satje',
            loadComponent: () =>
              import('./pages/fase2/satje/satje.component').then((m) => m.Fase2SatjeComponent),
          },
          {
            path: 'fase2/billing',
            loadComponent: () =>
              import('./pages/fase2/b2b-billing/b2b-billing.component').then(
                (m) => m.Fase2BillingComponent,
              ),
          },
        ],
      },
      {
        path: 'checkout/:id',
        loadComponent: () =>
          import('./pages/checkout/checkout.component').then((m) => m.CheckoutComponent),
        canActivate: [authGuard],
      },
      {
        path: 'upload/:id',
        loadComponent: () =>
          import('./pages/upload/upload.component').then((m) => m.UploadComponent),
        canActivate: [authGuard],
      },
      {
        path: 'consulta/:caseId',
        loadComponent: () =>
          import('./pages/virtual-meeting/virtual-meeting-page.component').then(
            (m) => m.VirtualMeetingPageComponent,
          ),
        canActivate: [authGuard],
      },
      {
        path: 'firma/:id',
        loadComponent: () => import('./pages/sign/sign.component').then((m) => m.SignComponent),
        canActivate: [authGuard],
      },
      {
        path: 'caso/:id',
        loadComponent: () =>
          import('./pages/case-detail/case-detail.component').then((m) => m.CaseDetailComponent),
        canActivate: [authGuard],
      },
      { path: 'fase2', redirectTo: 'abogado/fase2/admin', pathMatch: 'full' },
      { path: 'fase2/admin', redirectTo: 'abogado/fase2/admin', pathMatch: 'full' },
      { path: 'fase2/templates', redirectTo: 'abogado/fase2/templates', pathMatch: 'full' },
      { path: 'fase2/ai', redirectTo: 'abogado/fase2/ai', pathMatch: 'full' },
      { path: 'fase2/satje', redirectTo: 'abogado/fase2/satje', pathMatch: 'full' },
      { path: 'fase2/billing', redirectTo: 'abogado/fase2/billing', pathMatch: 'full' },
    ],
  },
  { path: '**', redirectTo: '' },
];
