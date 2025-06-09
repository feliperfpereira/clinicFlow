import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Subscription } from 'rxjs';
import { AlertService, Alert } from '../../services/alert.service';

@Component({
  selector: 'app-alert',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="alert-container">
      <div 
        *ngFor="let alert of alerts; trackBy: trackByAlertId" 
        class="alert" 
        [ngClass]="alert.type"
        [attr.data-alert-id]="alert.id"
        (mouseenter)="pauseTimer(alert.id)"
        (mouseleave)="resumeTimer(alert.id)"
>
        <div class="alert-content">
          <div class="alert-icon">
            <svg *ngIf="alert.type === 'success'" width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <circle cx="12" cy="12" r="10" fill="#10B981" stroke="#10B981" stroke-width="2"/>
              <path d="M9 12L11 14L15 10" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
            <svg *ngIf="alert.type === 'error'" width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <circle cx="12" cy="12" r="10" fill="#EF4444" stroke="#EF4444" stroke-width="2"/>
              <path d="M15 9L9 15" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
              <path d="M9 9L15 15" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
          </div>
          <div class="alert-text">
            <h4 class="alert-title">{{alert.title}}</h4>
            <p class="alert-message">{{alert.message}}</p>
          </div>
        </div>
        <button class="alert-close" (click)="removeAlert(alert.id)">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M18 6L6 18" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            <path d="M6 6L18 18" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
        </button>
        
        <!-- Barra de progresso -->
        <div *ngIf="alert.autoRemove" class="progress-bar-container">
          <div 
            class="progress-bar" 
            [ngClass]="alert.type"
            [style.animation-duration.ms]="alert.duration"
            [style.animation-play-state]="getTimerState(alert.id)"
          ></div>
        </div>
      </div>
    </div>
  `,
  styleUrl: './alert.component.css'
})
export class AlertComponent implements OnInit, OnDestroy {
  alerts: Alert[] = [];
  private subscription: Subscription = new Subscription();
  private pausedTimers: Set<string> = new Set();

  constructor(private alertService: AlertService) {}

  ngOnInit(): void {
    this.subscription.add(
      this.alertService.alerts$.subscribe(alert => {
        this.alerts.push(alert);
      })
    );
    
    this.subscription.add(
      this.alertService.remove$.subscribe(alertId => {
        // Adiciona classe de saída antes de remover
        const alertElement = document.querySelector(`[data-alert-id="${alertId}"]`);
        if (alertElement) {
          alertElement.classList.add('alert-exit');
          setTimeout(() => {
            this.alerts = this.alerts.filter(alert => alert.id !== alertId);
            this.pausedTimers.delete(alertId);
          }, 300); // Tempo da animação de saída
        } else {
          this.alerts = this.alerts.filter(alert => alert.id !== alertId);
          this.pausedTimers.delete(alertId);
        }
      })
    );
  }

  ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }

  removeAlert(id: string): void {
    // Adiciona classe de saída antes de remover
    const alertElement = document.querySelector(`[data-alert-id="${id}"]`);
    if (alertElement) {
      alertElement.classList.add('alert-exit');
      setTimeout(() => {
        this.alerts = this.alerts.filter(alert => alert.id !== id);
        this.alertService.remove(id);
        this.pausedTimers.delete(id);
      }, 300);
    } else {
      this.alerts = this.alerts.filter(alert => alert.id !== id);
      this.alertService.remove(id);
      this.pausedTimers.delete(id);
    }
  }

  pauseTimer(alertId: string): void {
    this.pausedTimers.add(alertId);
  }

  resumeTimer(alertId: string): void {
    this.pausedTimers.delete(alertId);
  }

  getTimerState(alertId: string): string {
    return this.pausedTimers.has(alertId) ? 'paused' : 'running';
  }

  trackByAlertId(index: number, alert: Alert): string {
    return alert.id;
  }
}