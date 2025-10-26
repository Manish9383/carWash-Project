
import { Component, inject, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { UserService } from '../services/user.service';
import { BookingService, ServicePlan, WasherBooking, WasherReport } from '../services/booking.service';
import { ReviewService } from '../services/review.service';
import { NotificationService, Notification } from '../services/notification.service';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Router } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { FormsModule } from '@angular/forms';



@Component({
  selector: 'app-washer-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    MatButtonModule,
    MatCardModule,
    MatProgressSpinnerModule,
    MatIconModule,
    MatTooltipModule,
    MatSlideToggleModule,
    FormsModule,
  ],
  templateUrl: './washer-dashboard.component.html',
  styleUrls: ['./washer-dashboard.component.scss'],
})
export class WasherDashboardComponent implements OnInit, OnDestroy {
  private reportInterval: any;
  private dataRefreshInterval: any;
  private userService = inject(UserService);
  private bookingService = inject(BookingService);
  private reviewService = inject(ReviewService);
  private notificationService = inject(NotificationService);
  private http = inject(HttpClient);
  private router = inject(Router);

  requests: WasherBooking[] = [];
  currentOrders: WasherBooking[] = [];
  pastOrders: WasherBooking[] = [];
  servicePlans: ServicePlan[] = [];
  washerId = this.userService.getCurrentUserId();
  isWasher = this.userService.getCurrentUserRole() === 'WASHER';
  selectedFiles: { [key: string]: File } = {};
  selectedFileNames: { [key: string]: string } = {};
  readonly MAX_FILE_SIZE = 5 * 1024 * 1024;
  serviceStatus: string = 'OFFLINE';
  loadingStatus: boolean = false;
  loadingDecline: { [key: string]: boolean } = {};
  loadingAccept: { [key: string]: boolean } = {};
  loadingStart: { [key: string]: boolean } = {};
  report: WasherReport | null = null;
  loadingReport: boolean = false;

  constructor() {}

  ngOnInit() {
    if (!this.isWasher) {
      console.warn('User is not a washer, redirecting to home');
      this.notificationService.pushNotification({
        id: `notif-${Date.now()}`,
        recipient: this.washerId || 'unknown',
        message: 'Access denied: You must be a washer to view this page.',
        timestamp: new Date().toISOString(),
        isRead: false
      });
      this.router.navigate(['/home']);
      return;
    }
    console.log('Washer Dashboard initialized for washerId:', this.washerId); // Debug log
    this.loadServiceStatus();
    this.loadServicePlans();
    this.loadRequests();
    this.loadCurrentOrders();
    this.loadPastOrders();
    this.loadReport();
    this.reportInterval = setInterval(() => {
      this.loadReport();
    }, 10000); // Refresh every 10 seconds
    
    // Real-time data refresh every 3 seconds
    this.dataRefreshInterval = setInterval(() => {
      this.loadRequests();
      this.loadCurrentOrders();
    }, 3000);
  }

  ngOnDestroy() {
    if (this.reportInterval) {
      clearInterval(this.reportInterval);
    }
    if (this.dataRefreshInterval) {
      clearInterval(this.dataRefreshInterval);
    }
  }

  loadServiceStatus() {
    this.loadingStatus = true;
    this.userService.getUserById(this.washerId).subscribe({
      next: (user) => {
        this.serviceStatus = user.serviceStatus || 'OFFLINE';
        this.loadingStatus = false;
        console.log('Service status loaded:', this.serviceStatus); // Debug log
      },
      error: (err) => {
        console.error('Error loading service status:', err);
        this.serviceStatus = 'OFFLINE';
        this.loadingStatus = false;
        this.notificationService.pushNotification({
          id: `notif-${Date.now()}`,
          recipient: this.washerId || 'unknown',
          message: 'Failed to load service status: ' + (err.message || 'Unknown error'),
          timestamp: new Date().toISOString(),
          isRead: false
        });
      },
    });
  }

  toggleServiceStatus() {
    const newStatus = this.serviceStatus === 'ONLINE' ? 'OFFLINE' : 'ONLINE';
    const oldStatus = this.serviceStatus;
    this.serviceStatus = newStatus; // Optimistic update
    this.loadingStatus = true;
    this.userService.updateServiceStatus(this.washerId, newStatus).subscribe({
      next: () => {
        this.loadingStatus = false;
        this.notificationService.pushNotification({
          id: `notif-${Date.now()}`,
          recipient: this.washerId || 'unknown',
          message: `Service status updated to ${newStatus}`,
          timestamp: new Date().toISOString(),
          isRead: false
        });
        console.log('Service status updated to:', newStatus); // Debug log
      },
      error: (err) => {
        console.error('Error updating service status:', err);
        this.serviceStatus = oldStatus; // Revert on error
        this.loadingStatus = false;
        this.notificationService.pushNotification({
          id: `notif-${Date.now()}`,
          recipient: this.washerId || 'unknown',
          message: 'Failed to update service status: ' + (err.message || 'Unknown error'),
          timestamp: new Date().toISOString(),
          isRead: false
        });
      },
    });
  }

  loadServicePlans() {
    this.bookingService.getServicePlans().subscribe({
      next: (plans) => {
        this.servicePlans = plans;
        console.log('Service plans loaded:', plans); // Debug log
      },
      error: (err) => {
        console.error('Error loading service plans:', err);
        this.notificationService.pushNotification({
          id: `notif-${Date.now()}`,
          recipient: this.washerId || 'unknown',
          message: 'Failed to load service plans: ' + (err.message || 'Unknown error'),
          timestamp: new Date().toISOString(),
          isRead: false
        });
      },
    });
  }
loadRequests() {
  this.bookingService.getWasherRequests(this.washerId).subscribe({
    next: (data: WasherBooking[]) => {
      this.requests = data;
      console.log('Loaded washer requests:', data); // Debug log
      if (data.length === 0) {
        console.warn('No requests found for washerId:', this.washerId);
        this.notificationService.pushNotification({
          id: `notif-${Date.now()}`,
          recipient: this.washerId || 'unknown',
          message: 'No pending or assigned requests available.',
          timestamp: new Date().toISOString(),
          isRead: false
        });
      } else {
        data.forEach(request => {
          console.log(
            `Request ID: ${request.id}, Status: ${request.status}, User Name: ${request.userName}, Notes: ${request.notes}`
          );
        });
      }
    },
    error: (err) => {
      console.error('Error loading requests:', err);
      this.notificationService.pushNotification({
        id: `notif-${Date.now()}`,
        recipient: this.washerId || 'unknown',
        message: 'Failed to load requests: ' + (err.message || 'Unknown error'),
        timestamp: new Date().toISOString(),
        isRead: false
      });
    },
  });
}

  loadCurrentOrders() {
    this.bookingService.getCurrentOrders(this.washerId).subscribe({
      next: (data: WasherBooking[]) => {
        this.currentOrders = data;
      },
      error: (err) => {
        console.error('Error loading current orders:', err);
        this.notificationService.pushNotification({
          id: `notif-${Date.now()}`,
          recipient: this.washerId || 'unknown',
          message: 'Failed to load current orders: ' + (err.message || 'Unknown error'),
          timestamp: new Date().toISOString(),
          isRead: false
        });
      },
    });
  }

  loadPastOrders() {
    this.bookingService.getPastOrders(this.washerId).subscribe({
      next: (data: WasherBooking[]) => {
        this.pastOrders = data.map(newOrder => {
          const existingOrder = this.pastOrders.find(o => o.id === newOrder.id);
          return {
            ...newOrder,
            receiptGenerated: existingOrder?.receiptGenerated ?? false,
            totalAmount: newOrder.totalAmount ?? this.getServicePlanPrice(newOrder.washPackage),
          };
        });
      },
      error: (err) => {
        console.error('Error loading past orders:', err);
        this.notificationService.pushNotification({
          id: `notif-${Date.now()}`,
          recipient: this.washerId || 'unknown',
          message: 'Failed to load past orders: ' + (err.message || 'Unknown error'),
          timestamp: new Date().toISOString(),
          isRead: false
        });
      },
    });
  }

  loadReport() {
    this.loadingReport = true;
    this.bookingService.getWasherReport(this.washerId).subscribe({
      next: (data: WasherReport) => {
        this.report = data;
        // Set today's date for the report since it's overall
        this.report.date = new Date().toLocaleDateString();
        this.loadingReport = false;
      },
      error: (err) => {
        console.error('Error loading report:', err);
        this.loadingReport = false;
        this.notificationService.pushNotification({
          id: `notif-${Date.now()}`,
          recipient: this.washerId || 'unknown',
          message: 'Failed to load report: ' + (err.message || 'Unknown error'),
          timestamp: new Date().toISOString(),
          isRead: false
        });
      },
    });
  }

  acceptRequest(bookingId: string) {
    if (!this.washerId) {
      this.notificationService.pushNotification({
        id: `notif-${Date.now()}`,
        recipient: 'unknown',
        message: 'User not logged in!',
        timestamp: new Date().toISOString(),
        isRead: false
      });
      return;
    }
    
    this.loadingAccept[bookingId] = true;
    
    // Optimistic update - move booking from requests to current orders
    const bookingIndex = this.requests.findIndex(r => r.id === bookingId);
    if (bookingIndex !== -1) {
      const booking = { ...this.requests[bookingIndex] };
      booking.status = 'ACCEPTED';
      booking.acknowledged = true;
      this.requests.splice(bookingIndex, 1);
      this.currentOrders.unshift(booking);
    }
    
    console.log(`Attempting to accept booking ID: ${bookingId} for washer ID: ${this.washerId}`);
    this.bookingService.acceptBooking(bookingId, this.washerId).subscribe({
      next: () => {
        this.loadingAccept[bookingId] = false;
        this.loadReport();
        this.notificationService.pushNotification({
          id: `notif-${Date.now()}`,
          recipient: this.washerId,
          message: 'Booking accepted successfully.',
          timestamp: new Date().toISOString(),
          isRead: false
        });
      },
      error: (err) => {
        this.loadingAccept[bookingId] = false;
        // Revert optimistic update on error
        this.loadRequests();
        this.loadCurrentOrders();
        console.error('Error accepting request:', err);
        this.notificationService.pushNotification({
          id: `notif-${Date.now()}`,
          recipient: this.washerId || 'unknown',
          message: 'Failed to accept request: ' + (err.message || 'Unknown error'),
          timestamp: new Date().toISOString(),
          isRead: false
        });
      },
    });
  }

  acknowledgeBooking(bookingId: string) {
    if (!this.washerId) {
      this.notificationService.pushNotification({
        id: `notif-${Date.now()}`,
        recipient: 'unknown',
        message: 'User not logged in!',
        timestamp: new Date().toISOString(),
        isRead: false
      });
      return;
    }
    console.log(`Attempting to acknowledge booking ID: ${bookingId} for washer ID: ${this.washerId}`); // Debug log
    this.bookingService.acknowledgeBooking(bookingId, this.washerId).subscribe({
      next: () => {
        this.loadRequests();
        this.loadCurrentOrders();
        this.loadReport();
        this.notificationService.pushNotification({
          id: `notif-${Date.now()}`,
          recipient: this.washerId,
          message: 'Booking acknowledged successfully.',
          timestamp: new Date().toISOString(),
          isRead: false
        });
      },
      error: (err) => {
        console.error('Error acknowledging booking:', err);
        this.notificationService.pushNotification({
          id: `notif-${Date.now()}`,
          recipient: this.washerId || 'unknown',
          message: 'Failed to acknowledge booking: ' + (err.message || 'Unknown error'),
          timestamp: new Date().toISOString(),
          isRead: false
        });
      },
    });
  }

  declineRequest(bookingId: string) {
    if (!this.washerId) {
      this.notificationService.pushNotification({
        id: `notif-${Date.now()}`,
        recipient: 'unknown',
        message: 'User not logged in!',
        timestamp: new Date().toISOString(),
        isRead: false
      });
      return;
    }
    this.loadingDecline[bookingId] = true;
    const reason = prompt('Please provide a reason for declining:') || 'No reason provided';
    console.log(`Attempting to decline booking ID: ${bookingId} with reason: ${reason}`); // Debug log
    this.bookingService.declineBooking(bookingId, this.washerId, reason).subscribe({
      next: () => {
        this.loadRequests();
        this.loadReport();
        this.notificationService.pushNotification({
          id: `notif-${Date.now()}`,
          recipient: this.washerId,
          message: 'Booking declined successfully.',
          timestamp: new Date().toISOString(),
          isRead: false
        });
        this.loadingDecline[bookingId] = false;
      },
      error: (err) => {
        console.error('Error declining request:', err);
        this.notificationService.pushNotification({
          id: `notif-${Date.now()}`,
          recipient: this.washerId || 'unknown',
          message: 'Failed to decline request: ' + (err.message || 'Unknown error'),
          timestamp: new Date().toISOString(),
          isRead: false
        });
        this.loadingDecline[bookingId] = false;
      },
    });
  }

  startProcessing(bookingId: string) {
    if (!this.washerId) {
      this.notificationService.pushNotification({
        id: `notif-${Date.now()}`,
        recipient: 'unknown',
        message: 'User not logged in!',
        timestamp: new Date().toISOString(),
        isRead: false
      });
      return;
    }
    
    this.loadingStart[bookingId] = true;
    
    // Optimistic update - change status to PROCESSING
    const booking = this.currentOrders.find(o => o.id === bookingId);
    if (booking) {
      booking.status = 'PROCESSING';
    }
    
    this.bookingService.startProcessing(bookingId, this.washerId).subscribe({
      next: () => {
        this.loadingStart[bookingId] = false;
        this.loadReport();
        this.notificationService.pushNotification({
          id: `notif-${Date.now()}`,
          recipient: this.washerId,
          message: 'Booking processing started.',
          timestamp: new Date().toISOString(),
          isRead: false
        });
      },
      error: (err) => {
        this.loadingStart[bookingId] = false;
        // Revert optimistic update on error
        this.loadCurrentOrders();
        console.error('Error starting processing:', err);
        this.notificationService.pushNotification({
          id: `notif-${Date.now()}`,
          recipient: this.washerId || 'unknown',
          message: 'Failed to start processing: ' + (err.message || 'Unknown error'),
          timestamp: new Date().toISOString(),
          isRead: false
        });
      },
    });
  }

  completeRequest(bookingId: string) {
    this.bookingService.completeBooking(bookingId).subscribe({
      next: () => {
        this.loadCurrentOrders();
        this.loadPastOrders();
        this.loadReport();
        this.notificationService.pushNotification({
          id: `notif-${Date.now()}`,
          recipient: this.washerId || 'unknown',
          message: 'Booking completed successfully.',
          timestamp: new Date().toISOString(),
          isRead: false
        });
      },
      error: (err) => {
        console.error('Error completing request:', err);
        this.notificationService.pushNotification({
          id: `notif-${Date.now()}`,
          recipient: this.washerId || 'unknown',
          message: 'Failed to complete request: ' + (err.message || 'Unknown error'),
          timestamp: new Date().toISOString(),
          isRead: false
        });
      },
    });
  }

  navigateToLocation(location: string) {
    const url = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(location)}`;
    window.open(url, '_blank');
  }

  onFileSelected(event: Event, order: WasherBooking) {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      const file = input.files[0];
      if (file.size > this.MAX_FILE_SIZE) {
        this.notificationService.pushNotification({
          id: `notif-${Date.now()}`,
          recipient: this.washerId || 'unknown',
          message: `File size exceeds ${this.MAX_FILE_SIZE / (1024 * 1024)}MB limit. Please upload a smaller file.`,
          timestamp: new Date().toISOString(),
          isRead: false
        });
        input.value = '';
        return;
      }
      this.selectedFiles[order.id] = file;
      this.selectedFileNames[order.id] = file.name;
    }
  }

  generateInvoice(order: WasherBooking) {
    const file = this.selectedFiles[order.id];
    if (!file) {
      this.notificationService.pushNotification({
        id: `notif-${Date.now()}`,
        recipient: this.washerId || 'unknown',
        message: 'Please upload an image first.',
        timestamp: new Date().toISOString(),
        isRead: false
      });
      return;
    }

    this.bookingService.uploadAfterWashPhoto(
      order.id,
      file,
      order.userId,
      this.washerId,
      order.carId,
      order.washPackage,
      order.notes || 'None',
      order.totalAmount ?? this.getServicePlanPrice(order.washPackage),
      order.transactionId || `txn_${Date.now()}`
    ).subscribe({
      next: (response) => {
        console.log('Invoice generated successfully:', response);
        order.receiptGenerated = true;
        delete this.selectedFiles[order.id];
        this.loadPastOrders();
        this.loadReport();
        this.notificationService.pushNotification({
          id: `notif-${Date.now()}`,
          recipient: this.washerId || 'unknown',
          message: 'Invoice generated successfully!',
          timestamp: new Date().toISOString(),
          isRead: false
        });
      },
      error: (err: HttpErrorResponse) => {
        console.error('Error generating invoice:', err);
        let errorMessage = 'Server error occurred';
        if (err.status === 413) {
          errorMessage = 'File too large. Please upload an image smaller than 5MB.';
        } else if (err.status === 403) {
          errorMessage = 'Permission denied: Ensure you have the correct role or token.';
        } else if (err.error && typeof err.error === 'object' && err.error.error) {
          errorMessage = err.error.error;
        }
        this.notificationService.pushNotification({
          id: `notif-${Date.now()}`,
          recipient: this.washerId || 'unknown',
          message: 'Failed to generate invoice: ' + errorMessage,
          timestamp: new Date().toISOString(),
          isRead: false
        });
      },
    });
  }

  viewReceipt(bookingId: string) {
    this.router.navigate(['/receipt'], { state: { bookingId } });
  }

  leaveReview(bookingId: string, customerId: string) {
    this.router.navigate(['/washer-reviews', bookingId, customerId]);
  }

  viewReviewsGiven() {
    this.router.navigate(['/washer-reviews-given']);
  }

  getServicePlanPrice(packageName: string): number {
    const plan = this.servicePlans.find(p => p.name.toLowerCase() === packageName.toLowerCase());
    if (!plan) {
      console.warn(`Service plan ${packageName} not found, using default price`);
      this.notificationService.pushNotification({
        id: `notif-${Date.now()}`,
        recipient: this.washerId || 'unknown',
        message: `Service plan ${packageName} not found, using default price of $200`,
        timestamp: new Date().toISOString(),
        isRead: false
      });
      return 200; // Default fallback price
    }
    return plan.price;
  }
}