import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-layout',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div class="layout">
      <aside class="sidebar">
        <div class="logo">
          <div class="logo-icon">
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M10 2C11.1046 2 12 2.89543 12 4V7H15C16.1046 7 17 7.89543 17 9V15C17 16.1046 16.1046 17 15 17H5C3.89543 17 3 16.1046 3 15V9C3 7.89543 3.89543 7 5 7H8V4C8 2.89543 8.89543 2 10 2Z" fill="#FF8A80"/>
              <rect x="6" y="9" width="8" height="1" fill="white" rx="0.5"/>
              <rect x="6" y="11" width="8" height="1" fill="white" rx="0.5"/>
              <rect x="6" y="13" width="6" height="1" fill="white" rx="0.5"/>
            </svg>
          </div>
          <span class="logo-text">ClinicFlow</span>
        </div>
        
        <nav class="nav">
          <a routerLink="/dashboard" routerLinkActive="active" class="nav-item">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M3 9L12 2L21 9V20C21 20.5304 20.7893 21.0391 20.4142 21.4142C20.0391 21.7893 19.5304 22 19 22H5C4.46957 22 3.96086 21.7893 3.58579 21.4142C3.21071 21.0391 3 20.5304 3 20V9Z" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
              <path d="M9 22V12H15V22" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
            Dashboard
          </a>
          
          <a routerLink="/patients" routerLinkActive="active" class="nav-item">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M16 7C16 9.20914 14.2091 11 12 11C9.79086 11 8 9.20914 8 7C8 4.79086 9.79086 3 12 3C14.2091 3 16 4.79086 16 7Z" stroke="currentColor" stroke-width="1.5"/>
              <path d="M12 14C8.13401 14 5 17.134 5 21H19C19 17.134 15.866 14 12 14Z" stroke="currentColor" stroke-width="1.5"/>
            </svg>
            Pacientes
          </a>
          
          <a routerLink="/appointments" routerLinkActive="active" class="nav-item">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <rect x="3" y="4" width="18" height="18" rx="2" ry="2" stroke="currentColor" stroke-width="1.5"/>
              <line x1="16" y1="2" x2="16" y2="6" stroke="currentColor" stroke-width="1.5"/>
              <line x1="8" y1="2" x2="8" y2="6" stroke="currentColor" stroke-width="1.5"/>
              <line x1="3" y1="10" x2="21" y2="10" stroke="currentColor" stroke-width="1.5"/>
            </svg>
            Agendamentos
          </a>
          
          <div class="nav-item disabled">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <circle cx="12" cy="12" r="3" stroke="currentColor" stroke-width="1.5"/>
              <circle cx="19" cy="12" r="2" stroke="currentColor" stroke-width="1.5"/>
              <circle cx="5" cy="12" r="2" stroke="currentColor" stroke-width="1.5"/>
            </svg>
            Pagamentos
            <span class="badge">Em breve</span>
          </div>
        </nav>
        
        <div class="sidebar-footer">
          <a routerLink="/profile" routerLinkActive="active" class="nav-item">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M12 12C15.3137 12 18 9.31371 18 6C18 2.68629 15.3137 0 12 0C8.68629 0 6 2.68629 6 6C6 9.31371 8.68629 12 12 12Z" stroke="currentColor" stroke-width="1.5"/>
              <path d="M2 24C2 19.5817 5.58172 16 10 16H14C18.4183 16 22 19.5817 22 24" stroke="currentColor" stroke-width="1.5"/>
            </svg>
            Minha conta
          </a>
          
          <button (click)="logout()" class="nav-item logout-btn">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M9 21H5C4.46957 21 3.96086 20.7893 3.58579 20.4142C3.21071 20.0391 3 19.5304 3 19V5C3 4.46957 3.21071 3.96086 3.58579 3.58579C3.96086 3.21071 4.46957 3 5 3H9" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
              <polyline points="16,17 21,12 16,7" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
              <line x1="21" y1="12" x2="9" y2="12" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
            Deslogar
          </button>
        </div>
      </aside>
      
      <main class="main-content">
        <router-outlet></router-outlet>
      </main>
    </div>
  `,
  styleUrl: './layout.component.css'
})
export class LayoutComponent {
  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  logout() {
    this.authService.logout().subscribe({
      next: () => {
        this.router.navigate(['/login']);
      },
      error: (error) => {
        console.error('Logout error:', error);
        this.router.navigate(['/login']);
      }
    });
  }
}