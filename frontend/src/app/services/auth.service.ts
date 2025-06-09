import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, tap, timer, switchMap, catchError, of } from 'rxjs';
import { environment } from '../../environments/environment';

export interface User {
  id: string;
  email: string;
}

export interface AuthResponse {
  message: string;
  user?: User;
  session?: any;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  email: string;
  password: string;
}

export interface ForgotPasswordRequest {
  email: string;
}

export interface ResetPasswordRequest {
  token: string;
  newPassword: string;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private readonly API_URL = `${environment.apiUrl}/auth`;
  private currentUserSubject = new BehaviorSubject<User | null>(null);
  public currentUser$ = this.currentUserSubject.asObservable();
  private refreshTimer: any;
  private readonly TOKEN_REFRESH_INTERVAL = 15 * 60 * 1000; // 15 minutos
  private readonly TOKEN_EXPIRY_BUFFER = 5 * 60 * 1000; // 5 minutos antes de expirar

  constructor(private http: HttpClient) {
    this.checkStoredAuth();
  }

  private checkStoredAuth(): void {
    const token = localStorage.getItem('authToken');
    const refreshToken = localStorage.getItem('refreshToken');
    const user = localStorage.getItem('user');
    
    if (token && refreshToken && user) {
      this.currentUserSubject.next(JSON.parse(user));
      this.startTokenRefreshTimer();
    }
  }

  private startTokenRefreshTimer(): void {
    this.stopTokenRefreshTimer();
    
    this.refreshTimer = timer(this.TOKEN_REFRESH_INTERVAL, this.TOKEN_REFRESH_INTERVAL)
      .pipe(
        switchMap(() => this.refreshToken()),
        catchError(error => {
          console.error('Auto refresh failed:', error);
          this.logout().subscribe();
          return of(null);
        })
      )
      .subscribe();
  }

  private stopTokenRefreshTimer(): void {
    if (this.refreshTimer) {
      this.refreshTimer.unsubscribe();
      this.refreshTimer = null;
    }
  }

  refreshToken(): Observable<AuthResponse> {
    const refreshToken = localStorage.getItem('refreshToken');
    
    if (!refreshToken) {
      throw new Error('No refresh token available');
    }

    return this.http.post<AuthResponse>(`${this.API_URL}/refresh`, {
      refresh_token: refreshToken
    }).pipe(
      tap(response => {
        if (response.session && response.user) {
          localStorage.setItem('authToken', response.session.access_token);
          localStorage.setItem('refreshToken', response.session.refresh_token);
          localStorage.setItem('user', JSON.stringify(response.user));
          this.currentUserSubject.next(response.user);
        }
      })
    );
  }

  login(credentials: LoginRequest): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.API_URL}/login`, credentials)
      .pipe(
        tap(response => {
          if (response.session && response.user) {
            localStorage.setItem('authToken', response.session.access_token);
            localStorage.setItem('refreshToken', response.session.refresh_token);
            localStorage.setItem('user', JSON.stringify(response.user));
            this.currentUserSubject.next(response.user);
            this.startTokenRefreshTimer();
          }
        })
      );
  }

  register(userData: RegisterRequest): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.API_URL}/register`, userData)
      .pipe(
        tap(response => {
          if (response.session && response.user) {
            localStorage.setItem('authToken', response.session.access_token);
            localStorage.setItem('refreshToken', response.session.refresh_token);
            localStorage.setItem('user', JSON.stringify(response.user));
            this.currentUserSubject.next(response.user);
            this.startTokenRefreshTimer();
          }
        })
      );
  }

  forgotPassword(data: ForgotPasswordRequest): Observable<any> {
    return this.http.post(`${this.API_URL}/forgot-password`, data);
  }

  resetPassword(data: ResetPasswordRequest): Observable<any> {
    return this.http.post(`${this.API_URL}/reset-password`, data);
  }

  logout(): Observable<any> {
    const token = localStorage.getItem('authToken');
    this.stopTokenRefreshTimer();
    
    return this.http.post(`${this.API_URL}/logout`, {}, {
      headers: token ? { Authorization: `Bearer ${token}` } : {}
    }).pipe(
      tap(() => {
        localStorage.removeItem('authToken');
        localStorage.removeItem('refreshToken');
        localStorage.removeItem('user');
        this.currentUserSubject.next(null);
      })
    );
  }

  verifyToken(): Observable<any> {
    const token = localStorage.getItem('authToken');
    if (!token) return new Observable(observer => observer.error('No token'));
    
    return this.http.get(`${this.API_URL}/verify`, {
      headers: { Authorization: `Bearer ${token}` }
    });
  }

  isAuthenticated(): boolean {
    return !!localStorage.getItem('authToken');
  }

  getCurrentUser(): User | null {
    return this.currentUserSubject.value;
  }

  getToken(): string | null {
    return localStorage.getItem('authToken');
  }
}