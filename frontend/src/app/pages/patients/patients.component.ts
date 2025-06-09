import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';
import { ApiService } from '../../services/api.service';
import { AlertService } from '../../services/alert.service';

interface Patient {
  id: string;
  name: string;
  email?: string;
  phone: string;
  birth_date?: string;
  address?: string;
  observations?: string;
  created_at: string;
  updated_at: string;
}

interface PatientResponse {
  patients: Patient[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}

interface Appointment {
  id?: string;
  patient_id: string;
  scheduled_date: string;
  scheduled_time: string;
  type: string;
  status: string;
  observations?: string;
}

@Component({
  selector: 'app-patients',
  standalone: true,
  imports: [CommonModule, FormsModule, HttpClientModule],
  templateUrl: './patients.component.html',
  styleUrl: './patients.component.css'
})
export class PatientsComponent implements OnInit {
  patients: Patient[] = [];
  loading = false;
  error = '';
  
  // Pagination
  currentPage = 1;
  totalPages = 1;
  totalPatients = 0;
  
  // Search and filters
  searchTerm = '';
  showFilters = false;
  
  // Modals
  showAddModal = false;
  showEditModal = false;
  showDeleteModal = false;
  showAppointmentModal = false;
  
  // Current patient for operations
  currentPatient: Partial<Patient> = {};
  patientToDelete: Patient | null = null;
  
  // Appointment-related properties
  selectedPatientForAppointment: Patient | null = null;
  currentAppointment: Partial<Appointment> = {};
  
  // Appointment types and statuses
  appointmentTypes = [
    { value: 'consulta', label: 'Consulta' },
    { value: 'acolhimento', label: 'Acolhimento' },
    { value: 'retorno', label: 'Retorno' }
  ];
  
  appointmentStatuses = [
    { value: 'pendente', label: 'Pendente' },
    { value: 'pago', label: 'Pago' },
    { value: 'cancelado', label: 'Cancelado' }
  ];

  constructor(
    private apiService: ApiService,
    private alertService: AlertService
  ) {}

  ngOnInit() {
    this.loadPatients();
  }

  loadPatients() {
    this.loading = true;
    this.error = '';
    
    const params = {
      page: this.currentPage.toString(),
      limit: '10',
      search: this.searchTerm
    };
    
    this.apiService.getPatients(params).subscribe({
      next: (response: PatientResponse) => {
        this.patients = response.patients;
        this.currentPage = response.pagination.page;
        this.totalPages = response.pagination.pages;
        this.totalPatients = response.pagination.total;
        this.loading = false;
      },
      error: (error) => {
        this.error = 'Erro ao carregar pacientes';
        this.loading = false;
        console.error('Error loading patients:', error);
      }
    });
  }

  onSearch() {
    this.currentPage = 1;
    this.loadPatients();
  }

  onPageChange(page: number) {
    this.currentPage = page;
    this.loadPatients();
  }

  openAddModal() {
    this.currentPatient = {
      name: '',
      email: '',
      phone: '',
      birth_date: '',
      address: '',
      observations: ''
    };
    this.showAddModal = true;
  }

  openEditModal(patient: Patient) {
    this.currentPatient = { 
      ...patient,
      address: patient.address || '',
      observations: patient.observations || ''
    };
    this.showEditModal = true;
  }

  openDeleteModal(patient: Patient) {
    this.patientToDelete = patient;
    this.showDeleteModal = true;
  }

  closeModals() {
    this.showAddModal = false;
    this.showEditModal = false;
    this.showDeleteModal = false;
    this.showAppointmentModal = false;
    this.currentPatient = {};
    this.patientToDelete = null;
    this.selectedPatientForAppointment = null;
    this.currentAppointment = {};
  }

  savePatient() {
    if (!this.currentPatient.name || !this.currentPatient.phone) {
      this.alertService.validationError();
      return;
    }

    if (this.showEditModal && this.currentPatient.id) {
      this.apiService.updatePatient(this.currentPatient.id, this.currentPatient).subscribe({
        next: (response) => {
          this.loadPatients();
          this.closeModals();
          this.alertService.patientUpdated();
        },
        error: (error) => {
          this.alertService.patientError();
          console.error('Error updating patient:', error);
        }
      });
    } else {
      this.apiService.createPatient(this.currentPatient).subscribe({
        next: (response) => {
          this.loadPatients();
          this.closeModals();
          this.alertService.patientCreated();
        },
        error: (error) => {
          this.alertService.patientError();
          console.error('Error creating patient:', error);
        }
      });
    }
  }

  deletePatient() {
    if (!this.patientToDelete) return;

    this.apiService.deletePatient(this.patientToDelete.id).subscribe({
      next: () => {
        this.loadPatients();
        this.closeModals();
        this.alertService.patientDeleted();
      },
      error: (error) => {
        this.alertService.patientError();
        console.error('Error deleting patient:', error);
      }
    });
  }

  calculateAge(birthDate: string): number {
    if (!birthDate) return 0;
    const today = new Date();
    const birth = new Date(birthDate);
    let age = today.getFullYear() - birth.getFullYear();
    const monthDiff = today.getMonth() - birth.getMonth();
    
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
      age--;
    }
    
    return age;
  }

  formatDate(dateString: string): string {
    return new Date(dateString).toLocaleDateString('pt-BR');
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

  openAppointmentModal(patient: Patient) {
    this.selectedPatientForAppointment = patient;
    this.currentAppointment = {
      patient_id: patient.id,
      status: 'pendente' // Default status
    };
    this.showAppointmentModal = true;
  }

  saveAppointment() {
    if (!this.currentAppointment.scheduled_date || !this.currentAppointment.scheduled_time || 
        !this.currentAppointment.type || !this.currentAppointment.status) {
      this.alertService.validationError();
      return;
    }

    this.apiService.createAppointment(this.currentAppointment).subscribe({
      next: () => {
        this.alertService.appointmentCreated();
        this.closeModals();
      },
      error: (error) => {
        this.alertService.appointmentError();
        console.error('Error creating appointment:', error);
      }
    });
  }

  getPatientPhoto(patient: Patient): string {
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