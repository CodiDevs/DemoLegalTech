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
}

@Injectable({ providedIn: 'root' })
export class ApiService {
  constructor(private http: HttpClient) {}

  evaluate(answers: QuestionnaireAnswers): Observable<QuestionnaireResult> {
    return this.http.post<QuestionnaireResult>('/api/v1/questionnaire', answers);
  }

  createCase(result: string, city: string, questionnaire?: QuestionnaireAnswers): Observable<CaseItem> {
    return this.http.post<CaseItem>('/api/v1/cases', { result, city, questionnaire: questionnaire || {} });
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

  generateMinuta(caseId: number): Observable<any> {
    return this.http.post(`/api/v1/cases/${caseId}/generate-minuta`, {});
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

  sign(id: number, image_data: string): Observable<any> {
    return this.http.post(`/api/v1/cases/${id}/signatures`, { image_data });
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

  mockAI(caseId?: number): Observable<any> {
    return this.http.post('/api/v1/mock/ai/analyze', { case_id: caseId ?? 0 });
  }

  mockSatje(): Observable<any> {
    return this.http.post('/api/v1/mock/satje/sync', {});
  }

  mockBilling(): Observable<any> {
    return this.http.get('/api/v1/mock/billing/recurring');
  }
}
