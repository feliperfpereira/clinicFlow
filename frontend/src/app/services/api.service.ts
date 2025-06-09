import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { AuthService } from './auth.service';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class ApiService {
  private readonly API_URL = environment.apiUrl;

  constructor(
    private http: HttpClient,
    private authService: AuthService
  ) {}

  private getHeaders(): HttpHeaders {
    const token = this.authService.getToken();
    return new HttpHeaders({
      'Content-Type': 'application/json',
      ...(token && { Authorization: `Bearer ${token}` })
    });
  }

  // Dashboard
  getDashboardStats(): Observable<any> {
    return this.http.get(`${this.API_URL}/dashboard/stats`, {
      headers: this.getHeaders()
    });
  }

  // Patients
  getPatients(params: any = {}): Observable<any> {
    let httpParams = new HttpParams();
    Object.keys(params).forEach(key => {
      if (params[key]) {
        httpParams = httpParams.set(key, params[key]);
      }
    });

    return this.http.get(`${this.API_URL}/patients`, {
      headers: this.getHeaders(),
      params: httpParams
    });
  }

  getPatient(id: string): Observable<any> {
    return this.http.get(`${this.API_URL}/patients/${id}`, {
      headers: this.getHeaders()
    });
  }

  createPatient(patient: any): Observable<any> {
    return this.http.post(`${this.API_URL}/patients`, patient, {
      headers: this.getHeaders()
    });
  }

  updatePatient(id: string, patient: any): Observable<any> {
    return this.http.put(`${this.API_URL}/patients/${id}`, patient, {
      headers: this.getHeaders()
    });
  }

  deletePatient(id: string): Observable<any> {
    return this.http.delete(`${this.API_URL}/patients/${id}`, {
      headers: this.getHeaders()
    });
  }

  // Appointments
  getAppointments(params: any = {}): Observable<any> {
    let httpParams = new HttpParams();
    Object.keys(params).forEach(key => {
      if (params[key]) {
        httpParams = httpParams.set(key, params[key]);
      }
    });

    return this.http.get(`${this.API_URL}/appointments`, {
      headers: this.getHeaders(),
      params: httpParams
    });
  }

  getNextAppointment(): Observable<any> {
    return this.http.get(`${this.API_URL}/appointments/next`, {
      headers: this.getHeaders()
    });
  }

  getAppointment(id: string): Observable<any> {
    return this.http.get(`${this.API_URL}/appointments/${id}`, {
      headers: this.getHeaders()
    });
  }

  createAppointment(appointment: any): Observable<any> {
    return this.http.post(`${this.API_URL}/appointments`, appointment, {
      headers: this.getHeaders()
    });
  }

  updateAppointment(id: string, appointment: any): Observable<any> {
    return this.http.put(`${this.API_URL}/appointments/${id}`, appointment, {
      headers: this.getHeaders()
    });
  }

  deleteAppointment(id: string): Observable<any> {
    return this.http.delete(`${this.API_URL}/appointments/${id}`, {
      headers: this.getHeaders()
    });
  }
}