import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';

export interface Alert {
  id: string;
  type: 'success' | 'error';
  title: string;
  message: string;
  timestamp: Date;
  duration: number;
  autoRemove?: boolean;
}

@Injectable({
  providedIn: 'root'
})
export class AlertService {
  private alertSubject = new Subject<Alert>();
  private removeSubject = new Subject<string>();
  public alerts$ = this.alertSubject.asObservable();
  public remove$ = this.removeSubject.asObservable();
  private alerts: Alert[] = [];

  constructor() {}

  private generateId(): string {
    return Math.random().toString(36).substr(2, 9);
  }

  success(title: string, message: string): void {
    const alert: Alert = {
      id: this.generateId(),
      type: 'success',
      title,
      message,
      timestamp: new Date(),
      duration: 5000,
      autoRemove: true
    };
    
    this.alerts.push(alert);
    this.alertSubject.next(alert);
    
    // Auto remove after 5 seconds
    setTimeout(() => {
      this.remove(alert.id);
    }, 5000);
  }

  error(title: string, message: string): void {
    const alert: Alert = {
      id: this.generateId(),
      type: 'error',
      title,
      message,
      timestamp: new Date(),
      duration: 5000,
      autoRemove: true
    };
    
    this.alerts.push(alert);
    this.alertSubject.next(alert);
    
    // Auto remove after 5 seconds (mudei para 5 segundos também)
    setTimeout(() => {
      this.remove(alert.id);
    }, 5000);
  }

  remove(id: string): void {
    this.alerts = this.alerts.filter(alert => alert.id !== id);
    this.removeSubject.next(id);
  }

  clear(): void {
    this.alerts = [];
  }

  // Convenience methods with common messages
  patientCreated(): void {
    this.success('Sucesso!', 'Paciente criado com sucesso! Tudo ocorreu como planejado.');
  }

  patientUpdated(): void {
    this.success('Sucesso!', 'Paciente atualizado com sucesso! Tudo ocorreu como planejado.');
  }

  patientDeleted(): void {
    this.success('Sucesso!', 'Paciente excluído com sucesso! Tudo ocorreu como planejado.');
  }

  appointmentCreated(): void {
    this.success('Sucesso!', 'Agendamento criado com sucesso! Tudo ocorreu como planejado.');
  }

  appointmentUpdated(): void {
    this.success('Sucesso!', 'Agendamento atualizado com sucesso! Tudo ocorreu como planejado.');
  }

  appointmentDeleted(): void {
    this.success('Sucesso!', 'Agendamento excluído com sucesso! Tudo ocorreu como planejado.');
  }

  appointmentStatusUpdated(): void {
    this.success('Sucesso!', 'Status do agendamento atualizado com sucesso! Tudo ocorreu como planejado.');
  }

  loginSuccess(): void {
    this.success('Sucesso!', 'Login realizado com sucesso! Bem-vindo de volta.');
  }

  registrationSuccess(): void {
    this.success('Sucesso!', 'Cadastro realizado com sucesso! Sua conta foi criada.');
  }

  // Error convenience methods
  patientError(): void {
    this.error('Erro!', 'Ocorreu um erro ao processar o paciente. Tente novamente e agradecemos pela compreensão.');
  }

  appointmentError(): void {
    this.error('Erro!', 'Ocorreu um erro ao processar o agendamento. Tente novamente e agradecemos pela compreensão.');
  }

  loginError(): void {
    this.error('Erro!', 'Credenciais inválidas. Verifique seu email e senha e tente novamente.');
  }

  networkError(): void {
    this.error('Erro!', 'Erro de conexão. Verifique sua internet e tente novamente.');
  }

  validationError(): void {
    this.error('Erro!', 'Por favor, preencha todos os campos obrigatórios corretamente.');
  }
}