import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { AuthService, User } from '../../services/auth.service';
import { ApiService } from '../../services/api.service';

interface DashboardStats {
  totalPatients: number;
  totalAppointments: number;
  todayAppointments: number;
}

interface NextAppointment {
  id: string;
  scheduled_date: string;
  scheduled_time: string;
  patients?: {
    id: string;
    name: string;
    phone: string;
  } | null;
}

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
})
export class DashboardComponent implements OnInit {
  user: User | null = null;
  stats: DashboardStats = {
    totalPatients: 0,
    totalAppointments: 0,
    todayAppointments: 0
  };
  nextAppointment: NextAppointment | null = null;
  loading = true;

  constructor(
    private authService: AuthService,
    private apiService: ApiService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.user = this.authService.getCurrentUser();
    if (!this.user) {
      this.router.navigate(['/login']);
      return;
    }
    
    this.loadDashboardData();
  }

  loadDashboardData(): void {
    this.loading = true;
    
    // Load stats and next appointment in parallel
    Promise.all([
      this.apiService.getDashboardStats().toPromise(),
      this.apiService.getNextAppointment().toPromise()
    ]).then(([stats, nextAppointment]) => {
      this.stats = stats;
      this.nextAppointment = nextAppointment;
      this.loading = false;
    }).catch(error => {
      console.error('Error loading dashboard data:', error);
      this.loading = false;
    });
  }

  hasData(): boolean {
    return this.stats.totalPatients > 0 || this.stats.totalAppointments > 0;
  }

  formatDate(dateString: string): string {
    const date = new Date(dateString);
    return date.toLocaleDateString('pt-BR', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  }

  formatTime(timeString: string): string {
    return timeString.substring(0, 5);
  }

  getUserName(): string {
    return this.user?.email.split('@')[0] || 'Usuário';
  }

  navigateToPatients(): void {
    this.router.navigate(['/patients']);
  }

  navigateToAppointments(): void {
    this.router.navigate(['/appointments']);
  }

  navigateToNewAppointment(): void {
    this.router.navigate(['/appointments'], { queryParams: { action: 'new' } });
  }
}