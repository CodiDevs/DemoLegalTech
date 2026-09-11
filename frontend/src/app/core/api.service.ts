import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface QuestionnaireAnswers {
  both_want_divorce: boolean;
  marriage_in_ecuador: boolean;
  have_children: boolean;
  minor_dependents: boolean;
  custody_regulated: boolean;
  has_mediation_acta: boolean;
  someone_abroad: boolean;
  have_assets: boolean;
  conjugal_society: boolean;
  ids_valid: boolean;
  want_liquidate_assets: boolean;
  country: string;
  province: string;
  city: string;
}

export interface QuestionnaireResult {
  code: 'apto' | 'evaluacion' | 'no_aplica';
  title: string;
  message: string;
  cta: string;
  price_usd: number;
  product: string;
}

export interface CaseItem {
  id: number;
  client_id: number;
  lawyer_id?: number;
  status: string;
  status_label: string;
  result: string;
  city: string;
  paid: boolean;
  amount_cents: number;
  created_at: string;
  updated_at: string;
  client_name?: string;
  client_email?: string;
  days_in_status?: number;
  sla_warning?: boolean;
  product?: string;
  notary_name?: string;
  appointment_at?: string;
  consultation_at?: string;
  has_minuta?: boolean;
  has_signature?: boolean;
  can_sign?: boolean;
  sign_hint?: string;
  questionnaire_json?: string;
}

@Injectable({ providedIn: 'root' })
export class ApiService {
  constructor(private http: HttpClient) {}

  evaluate(answers: QuestionnaireAnswers): Observable<QuestionnaireResult> {
    return this.http.post<QuestionnaireResult>('/api/v1/questionnaire', answers);
  }

  createCase(result: string, city: string, questionnaire?: QuestionnaireAnswers | Record<string, unknown>, product = 'divorcio360'): Observable<CaseItem> {
    return this.http.post<CaseItem>('/api/v1/cases', { result, city, questionnaire: questionnaire || {}, product });
  }

  listCases(): Observable<CaseItem[]> {
    return this.http.get<CaseItem[]>('/api/v1/cases');
  }

  getCase(id: number): Observable<any> {
    return this.http.get(`/api/v1/cases/${id}`);
  }

  getLawyerWorkspace(id: number): Observable<any> {
    return this.http.get(`/api/v1/cases/${id}/workspace`);
  }

  reviewDocument(caseId: number, docId: number, status: 'approved' | 'rejected', note: string): Observable<any> {
    return this.http.post(`/api/v1/cases/${caseId}/documents/${docId}/review`, { status, note });
  }

  uploadMinuta(caseId: number, file: File): Observable<any> {
    const fd = new FormData();
    fd.append('file', file);
    return this.http.post(`/api/v1/cases/${caseId}/minuta/upload`, fd);
  }

  performCaseAction(caseId: number, action: string, payload: Record<string, string> = {}): Observable<any> {
    return this.http.post(`/api/v1/cases/${caseId}/actions`, { action, payload });
  }

  addNote(id: number, body: string, visibleToClient = false): Observable<any> {
    return this.http.post(`/api/v1/cases/${id}/notes`, { body, visible_to_client: visibleToClient });
  }

  listNotifications(): Observable<any[]> {
    return this.http.get<any[]>('/api/v1/notifications');
  }

  markNotificationRead(id: number): Observable<any> {
    return this.http.post(`/api/v1/notifications/${id}/read`, {});
  }

  markAllNotificationsRead(): Observable<any> {
    return this.http.post('/api/v1/notifications/read-all', {});
  }

  mockSatjeLink(caseId: number, causeNo: string, court: string, confidence: number): Observable<any> {
    return this.http.post('/api/v1/mock/satje/link', { case_id: caseId, cause_no: causeNo, court, confidence });
  }

  mockSatjeLinks(caseId?: number): Observable<any> {
    const q = caseId ? `?case_id=${caseId}` : '';
    return this.http.get(`/api/v1/mock/satje/links${q}`);
  }

  patchBillingPlan(planId: string): Observable<any> {
    return this.http.patch('/api/v1/mock/billing/plan', { plan_id: planId });
  }

  patchMasterTemplate(id: string, version: string, note: string): Observable<any> {
    return this.http.patch(`/api/v1/mock/templates/master/${id}`, { version, note });
  }

  mockPay(id: number, holder: string, card_last4: string): Observable<any> {
    return this.http.post(`/api/v1/cases/${id}/payments/mock`, { holder, card_last4 });
  }

  listDocs(id: number): Observable<any[]> {
    return this.http.get<any[]>(`/api/v1/cases/${id}/documents`);
  }

  listOutputs(id: number): Observable<any[]> {
    return this.http.get<any[]>(`/api/v1/cases/${id}/outputs`);
  }

  uploadDoc(id: number, docType: string, file: File): Observable<any> {
    const fd = new FormData();
    fd.append('doc_type', docType);
    fd.append('file', file);
    return this.http.post(`/api/v1/cases/${id}/documents`, fd);
  }

  deleteDoc(caseId: number, docId: number): Observable<any> {
    return this.http.delete(`/api/v1/cases/${caseId}/documents/${docId}`);
  }

  sign(id: number, file: File): Observable<any> {
    const fd = new FormData();
    fd.append('file', file);
    return this.http.post(`/api/v1/cases/${id}/signatures`, fd);
  }

  listSignatures(id: number): Observable<any[]> {
    return this.http.get<any[]>(`/api/v1/cases/${id}/signatures`);
  }

  mockMetrics(): Observable<any> {
    return this.http.get('/api/v1/mock/admin/metrics');
  }

  mockTemplates(): Observable<any> {
    return this.http.get('/api/v1/mock/templates');
  }

  duplicateTemplate(id: string): Observable<any> {
    return this.http.post(`/api/v1/mock/templates/${id}/duplicate`, {});
  }

  patchTemplate(id: string, body: Record<string, unknown>): Observable<any> {
    return this.http.patch(`/api/v1/mock/templates/${id}`, body);
  }

  deleteTemplate(id: string): Observable<any> {
    return this.http.delete(`/api/v1/mock/templates/${id}`);
  }

  mockAI(caseId?: number): Observable<any> {
    return this.http.post('/api/v1/mock/ai/analyze', { case_id: caseId ?? 0 });
  }

  mockSatje(): Observable<any> {
    return this.http.post('/api/v1/mock/satje/sync', {});
  }

  mockBilling(): Observable<any> {
    return this.http.get('/api/v1/mock/billing/recurring');
  }

  scheduleAppointment(caseId: number, appointmentAt: string, notaryName = ''): Observable<any> {
    return this.http.post(`/api/v1/cases/${caseId}/appointment`, { appointment_at: appointmentAt, notary_name: notaryName });
  }

  scheduleConsultation(caseId: number, consultationAt: string): Observable<any> {
    return this.http.post(`/api/v1/cases/${caseId}/consultation/schedule`, { consultation_at: consultationAt });
  }

  requestConsultation(caseId: number): Observable<any> {
    return this.http.post(`/api/v1/cases/${caseId}/consultation/schedule`, {
      request_only: true,
      consultation_at: 'requested',
    });
  }

  requestMeeting(scheduledAt: string, product: string, context: string): Observable<any> {
    return this.http.post('/api/v1/meeting-requests', { scheduled_at: scheduledAt, product, context });
  }

  completeConsultation(caseId: number): Observable<any> {
    return this.http.post(`/api/v1/cases/${caseId}/consultation`, {});
  }

  notaryAction(caseId: number, action: string): Observable<any> {
    return this.http.post(`/api/v1/notary/cases/${caseId}/actions`, { action });
  }

  notaryQueue(): Observable<any[]> {
    return this.http.get<any[]>('/api/v1/notary/queue');
  }
}
