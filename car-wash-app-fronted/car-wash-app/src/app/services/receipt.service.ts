// import { Injectable } from '@angular/core';
// import { HttpClient, HttpErrorResponse } from '@angular/common/http';
// import { Observable, catchError, throwError } from 'rxjs';

// // Define Receipt interface to match backend model
// interface Receipt {
//   id: string;
//   userId: string;
//   washerId: string | null;
//   carModel: string;
//   packageName: string;
//   addOns: string;
//   totalAmount: number;
//   paymentDate: string; // ISO string
//   transactionId: string;
//   paymentStatus: string;
//   afterWashPhotoUrl: string;
// }

// @Injectable({
//   providedIn: 'root',
// })
// export class ReceiptService {
//   private baseUrl = '/api/receipt';

//   constructor(private http: HttpClient) {}

//   saveReceipt(receipt: Receipt): Observable<Receipt> {
//     return this.http.post<Receipt>(`${this.baseUrl}/save`, receipt).pipe(
//       catchError((error: HttpErrorResponse) => {
//         console.error('Receipt save error:', error);
//         return throwError(() => new Error(error.error?.error || 'Failed to save receipt'));
//       })
//     );
//   }

//   getUserReceipts(userId: string): Observable<Receipt[]> {
//     return this.http.get<Receipt[]>(`${this.baseUrl}/${userId}`).pipe(
//       catchError((error: HttpErrorResponse) => {
//         console.error('Receipt fetch error:', error);
//         return throwError(() => new Error('Failed to fetch receipts'));
//       })
//     );
//   }
// }
import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, tap } from 'rxjs/operators';
import { AuthService } from './auth.service';

export interface Receipt {
  id: string;
  userId: string;
  washerId: string | null;
  carModel: string;
  packageName: string;
  addOns: string;
  totalAmount: number;
  paymentDate: string;
  transactionId: string;
  paymentStatus: string;
  afterWashPhotoUrl: string;
}

@Injectable({
  providedIn: 'root',
})
export class ReceiptService {
  private baseUrl = '/api/receipt';

  constructor(private http: HttpClient, private authService: AuthService) {}

  private getHeaders(): HttpHeaders {
    const token = this.authService.getToken();
    console.log('ReceiptService Authorization header:', token ? `Bearer ${token}` : 'No token');
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

  saveReceipt(receipt: Receipt): Observable<Receipt> {
    console.log('✅ Sending receipt save request:', receipt);
    return this.http.post<Receipt>(`${this.baseUrl}/save`, receipt, { headers: this.getHeaders() }).pipe(
      tap(response => console.log('✅ Receipt saved:', response)),
      catchError((error: HttpErrorResponse) => {
        console.error('❌ Receipt save error:', {
          status: error.status,
          statusText: error.statusText,
          url: error.url,
          message: error.message,
          error: error.error?.error || error.error,
        });
        return throwError(() => new Error(error.error?.error || 'Failed to save receipt'));
      })
    );
  }

  getUserReceipts(userId: string): Observable<Receipt[]> {
    return this.http.get<Receipt[]>(`${this.baseUrl}/${userId}`, { headers: this.getHeaders() }).pipe(
      tap(response => console.log('✅ Fetched receipts for userId:', userId, response)),
      catchError((error: HttpErrorResponse) => {
        console.error('❌ Receipt fetch error:', error);
        return throwError(() => new Error('Failed to fetch receipts'));
      })
    );
  }

  getReceiptByBookingId(bookingId: string): Observable<Receipt> {
    return this.http.get<Receipt>(`${this.baseUrl}/by-booking/${bookingId}`, { headers: this.getHeaders() }).pipe(
      tap(response => console.log('✅ Fetched receipt for bookingId:', bookingId, response)),
      catchError((error: HttpErrorResponse) => {
        console.error('❌ Receipt fetch error for bookingId:', bookingId, error);
        return throwError(() => new Error('Failed to fetch receipt for booking ID: ' + bookingId));
      })
    );
  }
}