import { AfterViewInit, Renderer2, ElementRef, Component, OnInit, Inject, PLATFORM_ID } from '@angular/core';
import { gsap } from 'gsap';

import { CommonModule, isPlatformBrowser } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { BookingService, Booking } from '../../services/booking.service';
import { NotificationComponent } from '../../components/notification/notification.component';
import { NotificationService, Notification } from '../../services/notification.service';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-booking-history',
  standalone: true,
  imports: [CommonModule, NotificationComponent, MatButtonModule, MatIconModule, MatProgressSpinnerModule],
  templateUrl: './booking-history.component.html',
  styleUrls: ['./booking-history.component.scss']
})
export class BookingHistoryComponent implements OnInit {
  bookings: Booking[] = [];
  loading: boolean = false;
  errorMessage: string = '';
  private isBrowser: boolean;
  userRole: string | null = null;

  constructor(
    private bookingService: BookingService,
    private notificationService: NotificationService,
    private authService: AuthService,
    @Inject(PLATFORM_ID) private platformId: object,
    private router: Router,
    private renderer: Renderer2,
    private el: ElementRef
  ) {
    this.isBrowser = isPlatformBrowser(this.platformId);
  }
  completeBooking(event: Event, booking: any) {
    // Call your booking completion logic here (API call, etc.)
    // Optionally set booking.completionInProgress = true to hide the button
    // The animation will run automatically on button click
    // After completion, update booking.status = 'COMPLETED' and refresh list if needed
  }


  ngOnInit(): void {
    if (this.isBrowser) {
      this.userRole = this.authService.getUserRole();
      const userId = this.authService.getUserId();
      console.log('Booking History initialized for userId:', userId, 'Role:', this.userRole); // Debug log
      this.fetchUserBookings();
    }
  }

  fetchUserBookings(): void {
    this.loading = true;
    const userId = this.authService.getUserId();
    if (!userId) {
      this.errorMessage = 'User not logged in!';
      this.notificationService.pushNotification({
        id: `notif-${Date.now()}`,
        recipient: 'unknown',
        message: this.errorMessage,
        timestamp: new Date().toISOString(),
        isRead: false
      });
      this.loading = false;
      return;
    }

    this.bookingService.getBookingHistory(userId).subscribe({
      next: (data) => {
        this.bookings = data.length > 0 ? data : [];
        console.log('Loaded bookings:', data); // Debug log
        data.forEach(booking => {
          console.log(`Booking ID: ${booking.id}, Status: ${booking.status}, UserId: ${booking.userId}, WasherId: ${booking.washerId}, CanCancel: ${this.canCancel(booking)}`);
        });
        if (!data.length) {
          this.errorMessage = 'No bookings found!';
          this.notificationService.pushNotification({
            id: `notif-${Date.now()}`,
            recipient: userId,
            message: this.errorMessage,
            timestamp: new Date().toISOString(),
            isRead: false
          });
        }
      },
      error: (err) => {
        this.errorMessage = 'Failed to load booking history: ' + err.message;
        this.notificationService.pushNotification({
          id: `notif-${Date.now()}`,
          recipient: userId,
          message: this.errorMessage,
          timestamp: new Date().toISOString(),
          isRead: false
        });
        this.loading = false;
      },
      complete: () => this.loading = false
    });
  }

  getStatusClass(status: string): string {
    switch (status.toUpperCase()) {
      case 'PENDING': return 'pending';
      case 'ASSIGNED': return 'assigned'; // Added for ASSIGNED status
      case 'PROCESSING': return 'processing';
      case 'COMPLETED': return 'completed';
      case 'CANCELED': return 'cancelled';
      case 'DECLINED': return 'cancelled';
      default: return '';
    }
  }

  canCancel(booking: Booking): boolean {
    const userId = this.authService.getUserId();
    return (
      ['PENDING', 'ASSIGNED', 'ACCEPTED'].includes(booking.status.toUpperCase()) &&
      ((this.userRole === 'CUSTOMER' && booking.userId === userId) ||
       (this.userRole === 'WASHER' && booking.washerId === userId))
    );
  }

  cancelBooking(booking: Booking): void {
    if (!this.canCancel(booking)) {
      this.errorMessage = 'You are not authorized to cancel this booking or it cannot be canceled.';
      const userId = this.authService.getUserId();
      this.notificationService.pushNotification({
        id: `notif-${Date.now()}`,
        recipient: userId || 'unknown',
        message: this.errorMessage,
        timestamp: new Date().toISOString(),
        isRead: false
      });
      return;
    }

    const reason = prompt('Please provide a reason for cancellation:') || 'No reason provided';
    this.loading = true;
    this.errorMessage = '';

    const userId = this.authService.getUserId();
    if (!userId) {
      this.errorMessage = 'User not logged in!';
      this.notificationService.pushNotification({
        id: `notif-${Date.now()}`,
        recipient: 'unknown',
        message: this.errorMessage,
        timestamp: new Date().toISOString(),
        isRead: false
      });
      this.loading = false;
      return;
    }

    if (this.userRole === 'CUSTOMER') {
      this.bookingService.cancelBooking(booking.id, userId, reason).subscribe({
        next: () => {
          this.notificationService.pushNotification({
            id: `notif-${Date.now()}`,
            recipient: userId,
            message: 'Booking canceled successfully. You will receive a refund notification.',
            timestamp: new Date().toISOString(),
            isRead: false
          });
          // Notify washer if assigned
          if (booking.washerId) {
            this.notificationService.pushNotification({
              id: `notif-${Date.now()}`,
              recipient: booking.washerId,
              message: `Booking ${booking.id} was canceled by the customer. Reason: ${reason}`,
              timestamp: new Date().toISOString(),
              isRead: false
            });
          }
          this.fetchUserBookings();
        },
        error: (err) => {
          this.errorMessage = 'Failed to cancel booking: ' + err.message;
          this.notificationService.pushNotification({
            id: `notif-${Date.now()}`,
            recipient: userId,
            message: this.errorMessage,
            timestamp: new Date().toISOString(),
            isRead: false
          });
          this.loading = false;
        },
        complete: () => this.loading = false
      });
    } else if (this.userRole === 'WASHER') {
      this.bookingService.declineBooking(booking.id, userId, reason).subscribe({
        next: () => {
          this.notificationService.pushNotification({
            id: `notif-${Date.now()}`,
            recipient: userId,
            message: 'Booking declined successfully.',
            timestamp: new Date().toISOString(),
            isRead: false
          });
          this.fetchUserBookings();
        },
        error: (err) => {
          this.errorMessage = 'Failed to decline booking: ' + err.message;
          this.notificationService.pushNotification({
            id: `notif-${Date.now()}`,
            recipient: userId,
            message: this.errorMessage,
            timestamp: new Date().toISOString(),
            isRead: false
          });
          this.loading = false;
        },
        complete: () => this.loading = false
      });
    }
  }

  viewReceipt(bookingId: string) {
    this.router.navigate(['/receipt'], { state: { bookingId } });
  }

  leaveReview(bookingId: string, washerId: string | undefined) {
    const userId = this.authService.getUserId();
    if (!washerId) {
      this.errorMessage = 'Cannot leave a review: Washer ID is missing.';
      this.notificationService.pushNotification({
        id: `notif-${Date.now()}`,
        recipient: userId || 'unknown',
        message: this.errorMessage,
        timestamp: new Date().toISOString(),
        isRead: false
      });
      return;
    }
    this.router.navigate(['/reviews', bookingId, washerId]);
  }
}