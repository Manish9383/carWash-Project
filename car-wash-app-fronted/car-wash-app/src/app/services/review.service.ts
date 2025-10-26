import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { AuthService } from './auth.service';

// Define and export Review interface
export interface Review {
  id: string;
  customerId: string;
  customerName: string;
  washerId: string;
  washerName: string;
  bookingId: string;
  rating: number;
  comment?: string;
}

@Injectable({
  providedIn: 'root'
})
export class ReviewService {
  private apiUrl = '/api/reviews'; // Proxy path via API Gateway

  constructor(private http: HttpClient, private authService: AuthService) {}

  private getHeaders(): HttpHeaders {
    const token = localStorage.getItem('token');
    if (!token) {
      console.warn('No token found in localStorage');
    }
    return new HttpHeaders({
      'Content-Type': 'application/json',
      'Authorization': token ? `Bearer ${token}` : ''
    });
  }

  addReview(bookingId: string, customerId: string, washerId: string, rating: number, comment: string): Observable<Review> {
    const params = {
      bookingId,
      customerId,
      washerId,
      rating: rating.toString(),
      comment: comment || ''
    };
    const url = this.apiUrl; // Maps to POST /api/reviews
    console.log('Submitting review to:', url, 'with params:', params, 'headers:', this.getHeaders().keys());
    return this.http.post<Review>(url, null, { headers: this.getHeaders(), params })
      .pipe(
        catchError((error) => {
          console.error('Review Service Error:', error);
          if (error.status === 401 || error.status === 403) {
            this.authService.logout();
            return throwError(() => new Error('Authentication failed. Please log in again.'));
          }
          return throwError(() => new Error('Failed to submit review: ' + (error.message || 'Unknown error')));
        })
      );
  }

  addWasherReview(bookingId: string, washerId: string, customerId: string, rating: number, comment: string): Observable<Review> {
    const params = {
      bookingId,
      washerId,
      customerId,
      rating: rating.toString(),
      comment: comment || ''
    };
    const url = `${this.apiUrl}/washer`;
    console.log('Submitting washer review to:', url, 'with params:', params, 'headers:', this.getHeaders().keys());
    return this.http.post<Review>(url, null, { headers: this.getHeaders(), params })
      .pipe(
        catchError((error) => {
          console.error('Review Service Error:', error);
          if (error.status === 401 || error.status === 403) {
            this.authService.logout();
            return throwError(() => new Error('Authentication failed. Please log in again.'));
          }
          return throwError(() => new Error('Failed to submit review: ' + (error.message || 'Unknown error')));
        })
      );
  }

  getReviewsForWasher(washerId: string): Observable<Review[]> {
    const url = `${this.apiUrl}/washer/${washerId}`;
    console.log('Fetching reviews from:', url);
    return this.http.get<Review[]>(url, { headers: this.getHeaders() })
      .pipe(catchError(this.handleError));
  }

  getReviewsForCustomer(customerId: string): Observable<Review[]> {
    return this.http.get<Review[]>(`${this.apiUrl}/customer/${customerId}`, { headers: this.getHeaders() })
      .pipe(catchError(this.handleError));
  }

  getReviewsGivenByWasher(washerId: string): Observable<Review[]> {
    const url = `${this.apiUrl}/washer/${washerId}/given`;
    return this.http.get<Review[]>(url, { headers: this.getHeaders() })
      .pipe(catchError(this.handleError));
  }

  getReviewsGivenByCustomer(customerId: string): Observable<Review[]> {
    const url = `${this.apiUrl}/customer/${customerId}/given`;
    return this.http.get<Review[]>(url, { headers: this.getHeaders() })
      .pipe(catchError(this.handleError));
  }

  private handleError(error: any): Observable<never> {
    console.error('Review Service Error:', error);
    return throwError(() => new Error('Failed to process review request'));
  }
}