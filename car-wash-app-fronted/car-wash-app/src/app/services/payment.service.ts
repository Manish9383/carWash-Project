
import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, tap } from 'rxjs/operators';
import { AuthService } from './auth.service';

interface NotificationRequest {
  recipient: string;
  userEmail: string;
  bookingId: string;
  serviceName: string;
  bookingDate: string;
  bookingTime: string;
  amount: number;
}

@Injectable({
  providedIn: 'root',
})
export class PaymentService {
  private apiUrl = '/api/payment';
  private notificationApiUrl = '/api/notifications';

  constructor(private http: HttpClient, private authService: AuthService) {}

  private getHeaders(): HttpHeaders {
    const token = this.authService.getToken();
    console.log('PaymentService Authorization header:', token ? `Bearer ${token}` : 'No token');
    if (!token) {
      console.warn('No JWT token found for request');
      return new HttpHeaders({
        'Content-Type': 'application/json',
      });
    }
    return new HttpHeaders({
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    });
  }

  getClientToken(): Observable<{ clientToken: string }> {
    return this.http.get<{ clientToken: string }>(`${this.apiUrl}/token`, { headers: this.getHeaders() }).pipe(
      tap(response => console.log('✅ Client Token Response:', response)),
      catchError((error) => {
        console.error('❌ Error fetching client token:', error);
        return throwError(() => new Error('Failed to fetch payment client token: ' + (error.error?.error || error.message)));
      })
    );
  }

  processPayment(paymentData: { paymentMethodNonce: string; amount: string; bookingId?: string }): Observable<any> {
    console.log('✅ Sending payment request:', paymentData);
    return this.http.post(`${this.apiUrl}/checkout`, paymentData, { headers: this.getHeaders() }).pipe(
      tap(response => console.log('✅ Payment response:', response)),
      catchError((error) => {
        console.error('❌ Error processing payment:', {
          status: error.status,
          statusText: error.statusText,
          url: error.url,
          message: error.message,
          error: error.error?.error || error.error,
        });
        return throwError(() => new Error('Payment processing failed: ' + (error.error?.error || error.message)));
      })
    );
  }

  sendBookingNotification(notificationData: NotificationRequest): Observable<any> {
    console.log('✅ Sending notification request:', notificationData);
    return this.http.post(`${this.notificationApiUrl}/create`, notificationData, { headers: this.getHeaders() }).pipe(
      tap(() => console.log('✅ Notification sent successfully')),
      catchError((error) => {
        console.error('❌ Error sending notification:', error);
        return throwError(() => new Error('Failed to send booking notification: ' + (error.error?.error || error.message)));
      })
    );
  }
}