import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';
import { ApiService } from '../../services/api.service';
import { AlertService } from '../../services/alert.service';

interface Patient {
  id: string;
  name: string;
  email: string;
  phone: string;
}

interface Appointment {
  id: string;
  patient_id: string;
  scheduled_date: string;
  scheduled_time: string;
  type: string;
  status: string;
  observations?: string | null;
  created_at: string;
  updated_at: string;
  patients?: Patient | null;
}

interface AppointmentResponse {
  appointments: Appointment[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}

@Component({
  selector: 'app-appointments',
  standalone: true,
  imports: [CommonModule, FormsModule, HttpClientModule],
  templateUrl: './appointments.component.html',
  styleUrl: './appointments.component.css'
})
export class AppointmentsComponent implements OnInit {
  appointments: Appointment[] = [];
  patients: Patient[] = [];
  loading = false;
  error = '';
  
  // Pagination
  currentPage = 1;
  totalPages = 1;
  totalAppointments = 0;
  
  // Search and filters
  searchTerm = '';
  showFilters = false;
  statusFilter = '';
  typeFilter = '';
  dateFilter = '';
  
  // Modals
  showAddModal = false;
  showEditModal = false;
  showDeleteModal = false;
  showDetailsModal = false;
  
  // Current appointment for operations
  currentAppointment: Partial<Appointment> = {};
  appointmentToDelete: Appointment | null = null;
  appointmentDetails: Appointment | null = null;

  appointmentTypes = [
    { value: 'consulta', label: 'Consulta' },
    { value: 'acolhimento', label: 'Acolhimento' },
    { value: 'retorno', label: 'Retorno' }
  ];

  appointmentStatuses = [
    { value: 'pago', label: 'Pago' },
    { value: 'pendente', label: 'Pendente' },
    { value: 'cancelado', label: 'Cancelado' }
  ];

  constructor(
    private apiService: ApiService,
    private alertService: AlertService
  ) {}

  ngOnInit() {
    this.loadAppointments();
    this.loadPatients();
  }

  loadAppointments() {
    this.loading = true;
    this.error = '';
    
    const params: any = {
      page: this.currentPage.toString(),
      limit: '10',
      search: this.searchTerm
    };

    if (this.statusFilter) params.status = this.statusFilter;
    if (this.typeFilter) params.type = this.typeFilter;
    if (this.dateFilter) params.date = this.dateFilter;
    
    this.apiService.getAppointments(params).subscribe({
      next: (response: AppointmentResponse) => {
        this.appointments = response.appointments;
        this.currentPage = response.pagination.page;
        this.totalPages = response.pagination.pages;
        this.totalAppointments = response.pagination.total;
        this.loading = false;
      },
      error: (error) => {
        this.error = 'Erro ao carregar agendamentos';
        this.loading = false;
        console.error('Error loading appointments:', error);
      }
    });
  }

  loadPatients() {
    this.apiService.getPatients({ page: '1', limit: '1000' }).subscribe({
      next: (response: any) => {
        this.patients = response.patients;
      },
      error: (error) => {
        console.error('Error loading patients:', error);
      }
    });
  }

  onSearch() {
    this.currentPage = 1;
    this.loadAppointments();
  }

  onFilterChange() {
    this.currentPage = 1;
    this.loadAppointments();
  }

  clearFilters() {
    this.searchTerm = '';
    this.statusFilter = '';
    this.typeFilter = '';
    this.dateFilter = '';
    this.currentPage = 1;
    this.loadAppointments();
  }

  onPageChange(page: number) {
    this.currentPage = page;
    this.loadAppointments();
  }

  openAddModal() {
    this.currentAppointment = {
      status: 'pendente',
      type: 'consulta'
    };
    this.showAddModal = true;
  }

  openEditModal(appointment: Appointment) {
    this.currentAppointment = { ...appointment };
    this.showEditModal = true;
  }

  openDeleteModal(appointment: Appointment) {
    this.appointmentToDelete = appointment;
    this.showDeleteModal = true;
  }

  openDetailsModal(appointment: Appointment) {
    this.appointmentDetails = appointment;
    this.showDetailsModal = true;
  }

  closeModals() {
    this.showAddModal = false;
    this.showEditModal = false;
    this.showDeleteModal = false;
    this.showDetailsModal = false;
    this.currentAppointment = {};
    this.appointmentToDelete = null;
    this.appointmentDetails = null;
  }

  saveAppointment() {
    if (!this.currentAppointment.patient_id || !this.currentAppointment.scheduled_date || 
        !this.currentAppointment.scheduled_time || !this.currentAppointment.type) {
      this.alertService.validationError();
      return;
    }

    if (this.showEditModal && this.currentAppointment.id) {
      this.apiService.updateAppointment(this.currentAppointment.id, this.currentAppointment).subscribe({
        next: () => {
          this.loadAppointments();
          this.closeModals();
          this.alertService.appointmentUpdated();
        },
        error: (error) => {
          this.alertService.appointmentError();
          console.error('Error updating appointment:', error);
        }
      });
    } else {
      this.apiService.createAppointment(this.currentAppointment).subscribe({
        next: () => {
          this.loadAppointments();
          this.closeModals();
          this.alertService.appointmentCreated();
        },
        error: (error) => {
          this.alertService.appointmentError();
          console.error('Error creating appointment:', error);
        }
      });
    }
  }

  deleteAppointment() {
    if (!this.appointmentToDelete) return;

    this.apiService.deleteAppointment(this.appointmentToDelete.id).subscribe({
      next: () => {
        this.loadAppointments();
        this.closeModals();
        this.alertService.appointmentDeleted();
      },
      error: (error) => {
        this.alertService.appointmentError();
        console.error('Error deleting appointment:', error);
      }
    });
  }

  updateStatus(appointment: Appointment, status: string) {
    const updatedAppointment = { ...appointment, status };
    this.apiService.updateAppointment(appointment.id, updatedAppointment).subscribe({
      next: () => {
        this.loadAppointments();
        this.alertService.appointmentStatusUpdated();
      },
      error: (error) => {
        this.alertService.appointmentError();
        console.error('Error updating status:', error);
      }
    });
  }

  formatDate(dateString: string): string {
    return new Date(dateString).toLocaleDateString('pt-BR');
  }

  formatTime(timeString: string): string {
    return timeString.substring(0, 5);
  }

  formatDateTime(date: string, time: string): string {
    return `${this.formatDate(date)} às ${this.formatTime(time)}`;
  }

  getStatusClass(status: string): string {
    switch (status) {
      case 'pago': return 'status-paid';
      case 'pendente': return 'status-pending';
      case 'cancelado': return 'status-cancelled';
      default: return '';
    }
  }

  getStatusLabel(status: string): string {
    const statusObj = this.appointmentStatuses.find(s => s.value === status);
    return statusObj ? statusObj.label : status;
  }

  getTypeLabel(type: string): string {
    const typeObj = this.appointmentTypes.find(t => t.value === type);
    return typeObj ? typeObj.label : type;
  }

  getPatientName(patientId: string): string {
    const patient = this.patients.find(p => p.id === patientId);
    return patient ? patient.name : '';
  }

  getPaginationPages(): number[] {
    const pages = [];
    const maxPagesToShow = 5;
    let startPage = Math.max(1, this.currentPage - 2);
    let endPage = Math.min(this.totalPages, startPage + maxPagesToShow - 1);
    
    if (endPage - startPage + 1 < maxPagesToShow) {
      startPage = Math.max(1, endPage - maxPagesToShow + 1);
    }
    
    for (let i = startPage; i <= endPage; i++) {
      pages.push(i);
    }
    
    return pages;
  }

  getPatientPhoto(patient: Patient | null | undefined): string {
    if (!patient || !patient.name) {
      return 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=150&h=150&fit=crop&crop=face';
    }
    
    // Sample patient photos to match the design
    const samplePhotos = [
      'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=150&h=150&fit=crop&crop=face',
      'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face',
      'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&h=150&fit=crop&crop=face',
      'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop&crop=face',
      'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face',
      'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&h=150&fit=crop&crop=face',
      'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=150&h=150&fit=crop&crop=face'
    ];
    
    // Use a consistent photo based on patient name hash
    const hash = patient.name.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
    return samplePhotos[hash % samplePhotos.length];
  }
}