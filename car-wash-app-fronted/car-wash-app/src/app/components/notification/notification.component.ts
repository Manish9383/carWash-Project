import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NotificationService, Notification } from '../../services/notification.service';
import { UserService } from '../../services/user.service';
import { Subscription } from 'rxjs';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

@Component({
  selector: 'app-notification',
  standalone: true,
  imports: [CommonModule, MatIconModule, MatProgressSpinnerModule],
  templateUrl: './notification.component.html',
  styleUrls: ['./notification.component.scss']
})
export class NotificationComponent implements OnInit, OnDestroy {
  notifications: Notification[] = [];
  unreadCount: number = 0;
  showDropdown: boolean = false;
  loading: boolean = false;
  error: string | null = null;
  private subscription: Subscription = new Subscription();

  constructor(
    private notificationService: NotificationService,
    private userService: UserService
  ) {}

  ngOnInit(): void {
    const userId = this.userService.getCurrentUserId();
    console.log('🔍 User ID from localStorage:', userId);
    if (userId) {
      this.loading = true;
      this.notificationService.getUserNotifications(userId).subscribe({
        next: (notifications) => {
          console.log('✅ Raw API response:', notifications);
          this.notifications = notifications || [];
          this.unreadCount = this.notifications.filter(n => !n.isRead).length;
          console.log('✅ Processed initial notifications:', this.notifications);
          this.loading = false;
        },
        error: (err) => {
          this.error = `Failed to load initial notifications: ${err.status || 'N/A'} - ${err.message || err}`;
          console.error('❌ Error fetching initial notifications:', err);
          this.notifications = [];
          this.unreadCount = 0;
          this.loading = false;
        }
      });

      this.notificationService.connect(userId);
      this.subscription = this.notificationService.getNotifications().subscribe({
        next: (notifications) => {
          console.log('✅ Real-time notifications:', notifications);
          this.notifications = notifications;
          this.unreadCount = this.notifications.filter(n => !n.isRead).length;
        },
        error: (err) => {
          console.error('❌ Error in real-time notifications:', err);
        }
      });
    } else {
      this.error = 'No user ID found. Please log in.';
      console.error('⚠ No userId found in localStorage');
    }
  }

  ngOnDestroy(): void {
    this.notificationService.disconnect();
    this.subscription.unsubscribe();
  }

  toggleDropdown(): void {
    this.showDropdown = !this.showDropdown;
  }

  // Add a type property to each notification for UI (info, success, error, warning)
  private getNotificationType(notification: Notification): string {
    // Example: you can customize this logic based on your backend or message content
    if (notification.message?.toLowerCase().includes('success')) return 'success';
    if (notification.message?.toLowerCase().includes('error') || notification.message?.toLowerCase().includes('fail')) return 'error';
    if (notification.message?.toLowerCase().includes('warning')) return 'warning';
    return 'info';
  }

  // Add markAllAsRead method
  markAllAsRead(): void {
    this.notifications = this.notifications.map(n => ({ ...n, isRead: true }));
    this.unreadCount = 0;
    // Optionally, call backend to mark as read
    // this.notificationService.markAllAsRead().subscribe();
  }

  // Helper for template to get type
  notificationType(notification: Notification): string {
    return (notification as any).type || this.getNotificationType(notification);
  }
}