import { Routes } from '@angular/router';
import { ShellComponent } from './layout/shell.component';
import { SaasLandingComponent } from './pages/saas/saas-landing.component';
import { DivorcioLandingComponent } from './pages/saas/divorcio-landing.component';
import { ProductLandingComponent } from './pages/product-site/product-landing.component';
import { ProductQuestionnaireComponent } from './pages/product-site/product-questionnaire.component';
import { QuestionnaireComponent } from './pages/questionnaire/questionnaire.component';
import { AuthComponent } from './pages/auth/auth.component';
import { CheckoutComponent } from './pages/checkout/checkout.component';
import { UploadComponent } from './pages/upload/upload.component';
import { SignComponent } from './pages/sign/sign.component';
import { ClientPanelComponent } from './pages/client-panel/client-panel.component';
import { LawyerShellComponent } from './pages/lawyer-panel/lawyer-shell.component';
import { LawyerPanelComponent } from './pages/lawyer-panel/lawyer-panel.component';
import { LawyerCaseComponent } from './pages/lawyer-case/lawyer-case.component';
import { CaseDetailComponent } from './pages/case-detail/case-detail.component';
import { VirtualMeetingPageComponent } from './pages/virtual-meeting/virtual-meeting-page.component';
import { Fase2ShellComponent } from './pages/fase2/fase2-shell.component';
import { Fase2AdminComponent } from './pages/fase2/admin/admin.component';
import { Fase2TemplatesComponent } from './pages/fase2/templates/templates.component';
import { Fase2AiComponent } from './pages/fase2/ai-agent/ai-agent.component';
import { Fase2SatjeComponent } from './pages/fase2/satje/satje.component';
import { Fase2BillingComponent } from './pages/fase2/b2b-billing/b2b-billing.component';
import { ProductExpedienteComponent } from './pages/client-panel/product-expediente.component';
import { LegalPageComponent } from './pages/legal/legal-page.component';
import { authGuard, roleGuard, clienteOrGuestGuard } from './core/guards';

export const routes: Routes = [
  {
    path: '',
    component: ShellComponent,
    children: [
      { path: '', component: SaasLandingComponent },
      { path: 'productos/divorcio360', component: DivorcioLandingComponent },
      { path: 'productos/:slug', component: ProductLandingComponent },
      { path: 'productos/:slug/cuestionario', component: ProductQuestionnaireComponent, canActivate: [clienteOrGuestGuard] },
      { path: 'productos/:slug/expediente', component: ProductExpedienteComponent, canActivate: [roleGuard('cliente')] },
      { path: 'intake/traslado360', redirectTo: 'productos/traslado360/cuestionario', pathMatch: 'full' },
      { path: 'intake/bienraiz360', redirectTo: 'productos/bienraiz360/cuestionario', pathMatch: 'full' },
      { path: 'cuestionario', component: QuestionnaireComponent, canActivate: [clienteOrGuestGuard] },
      { path: 'auth', component: AuthComponent },
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
      { path: 'cliente', component: ClientPanelComponent, canActivate: [roleGuard('cliente')] },
      {
        path: 'abogado',
        component: LawyerShellComponent,
        canActivate: [roleGuard('abogado')],
        children: [
          { path: '', component: LawyerPanelComponent },
          { path: 'caso/:id', component: LawyerCaseComponent },
        ],
      },
      { path: 'checkout/:id', component: CheckoutComponent, canActivate: [authGuard] },
      { path: 'upload/:id', component: UploadComponent, canActivate: [authGuard] },
      { path: 'consulta/:caseId', component: VirtualMeetingPageComponent, canActivate: [authGuard] },
      { path: 'firma/:id', component: SignComponent, canActivate: [authGuard] },
      { path: 'caso/:id', component: CaseDetailComponent, canActivate: [authGuard] },
      {
        path: 'fase2',
        component: Fase2ShellComponent,
        canActivate: [roleGuard('abogado')],
        children: [
          { path: '', redirectTo: 'admin', pathMatch: 'full' },
          { path: 'admin', component: Fase2AdminComponent },
          { path: 'templates', component: Fase2TemplatesComponent },
          { path: 'ai', component: Fase2AiComponent },
          { path: 'satje', component: Fase2SatjeComponent },
          { path: 'billing', component: Fase2BillingComponent },
        ],
      },
    ],
  },
  { path: '**', redirectTo: '' },
];
