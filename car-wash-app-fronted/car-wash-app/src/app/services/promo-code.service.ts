// src/app/services/promo-code.service.ts
import { Injectable, Inject, PLATFORM_ID } from '@angular/core';
import { HttpClient, HttpHeaders, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, tap } from 'rxjs/operators';
import { isPlatformBrowser } from '@angular/common';

export interface PromoCode {
  id: string;
  code: string;
  discountType: 'PERCENTAGE' | 'FIXED';
  discountValue: number;
  active: boolean;
  expiryDate?: string;
  maxUses?: number;
  currentUses: number;
}

@Injectable({
  providedIn: 'root',
})
export class PromoCodeService {
  private apiUrl = '/api/bookings/promo-codes';

  constructor(
    private http: HttpClient,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {}

  private getHeaders(): HttpHeaders {
    let token: string | null = null;
    if (isPlatformBrowser(this.platformId)) {
      token = localStorage.getItem('token');
    }
    return new HttpHeaders({
      'Content-Type': 'application/json',
      Authorization: token ? `Bearer ${token}` : '',
    });
  }

  getPromoCodes(): Observable<PromoCode[]> {
    return this.http
      .get<PromoCode[]>(`${this.apiUrl}`, { headers: this.getHeaders() })
      .pipe(
        tap((response) => console.log('Fetched promo codes:', response)),
        catchError(this.handleError)
      );
  }

  createPromoCode(promoCode: Partial<PromoCode>): Observable<PromoCode> {
    return this.http
      .post<PromoCode>(`${this.apiUrl}/create`, promoCode, {
        headers: this.getHeaders(),
      })
      .pipe(
        tap((response) => console.log('Created promo code:', response)),
        catchError(this.handleError)
      );
  }

  updatePromoCode(id: string, promoCode: Partial<PromoCode>): Observable<PromoCode> {
    return this.http
      .put<PromoCode>(`${this.apiUrl}/${id}`, promoCode, {
        headers: this.getHeaders(),
      })
      .pipe(
        tap((response) => console.log('Updated promo code:', response)),
        catchError(this.handleError)
      );
  }

  togglePromoCodeStatus(id: string, active: boolean): Observable<any> {
    return this.http
      .put(`${this.apiUrl}/${id}/toggle`, { active }, {
        headers: this.getHeaders(),
      })
      .pipe(
        tap((response) => console.log(`Toggled promo code ${id} to active=${active}`)),
        catchError(this.handleError)
      );
  }

  private handleError(error: HttpErrorResponse): Observable<never> {
    console.error('PromoCodeService Error:', {
      status: error.status,
      statusText: error.statusText,
      url: error.url,
      message: error.message,
      error: error.error,
    });
    let errorMessage = 'Failed to process promo code request';
    if (error.status === 400) {
      errorMessage = error.error?.error || 'Invalid input data';
    } else if (error.status === 401) {
      errorMessage = 'Unauthorized - please log in again';
    } else if (error.status === 403) {
      errorMessage = 'You do not have permission to perform this action';
    } else if (error.status === 404) {
      errorMessage = 'Promo code not found';
    } else if (error.status === 0) {
      errorMessage = 'Network error - check backend server';
    }
    return throwError(() => new Error(errorMessage));
  }


  deletePromoCode(id: string): Observable<any> {
  return this.http
    .delete(`${this.apiUrl}/${id}`, { headers: this.getHeaders() })
    .pipe(
      tap(() => console.log(`Deleted promo code ${id}`)),
      catchError(this.handleError)
    );
}
}