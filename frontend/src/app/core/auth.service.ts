import { Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { catchError, tap, timeout } from 'rxjs/operators';
import { Observable, throwError } from 'rxjs';

export interface User {
  id: number;
  email: string;
  full_name: string;
  phone: string;
  role: 'cliente' | 'abogado' | 'notario';
}

interface AuthResponse {
  token: string;
  user: User;
}

const TOKEN_KEY = 'd360_token';
const USER_KEY = 'd360_user';

@Injectable({ providedIn: 'root' })
export class AuthService {
  user = signal<User | null>(this.readUser());

  constructor(private http: HttpClient, private router: Router) {}

  get token(): string | null {
    return localStorage.getItem(TOKEN_KEY);
  }

  get isLoggedIn(): boolean {
    return !!this.token;
  }

  login(email: string, password: string): Observable<AuthResponse> {
    return this.http.post<AuthResponse>('/api/v1/auth/login', { email, password }).pipe(
      timeout(15000),
      tap((res) => this.persist(res)),
      catchError((err) => this.authError(err)),
    );
  }

  register(payload: { email: string; password: string; full_name: string; phone?: string; lopdp_accepted?: boolean }): Observable<AuthResponse> {
    return this.http.post<AuthResponse>('/api/v1/auth/register', payload).pipe(
      timeout(15000),
      tap((res) => this.persist(res)),
      catchError((err) => this.authError(err)),
    );
  }

  logout(): void {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
    this.user.set(null);
    void this.router.navigateByUrl('/');
  }

  private persist(res: AuthResponse): void {
    localStorage.setItem(TOKEN_KEY, res.token);
    localStorage.setItem(USER_KEY, JSON.stringify(res.user));
    this.user.set(res.user);
  }

  private authError(err: unknown) {
    const e = err as { name?: string; status?: number };
    if (e?.name === 'TimeoutError') {
      return throwError(() => ({
        status: 0,
        error: {
          error: 'El servidor tardó demasiado. Inténtalo de nuevo en un momento.',
        },
      }));
    }
    return throwError(() => err);
  }

  private readUser(): User | null {
    const raw = localStorage.getItem(USER_KEY);
    if (!raw) return null;
    try {
      return JSON.parse(raw) as User;
    } catch {
      return null;
    }
  }
}
