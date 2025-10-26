import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, tap, map } from 'rxjs/operators';
import { UserService, User } from './user.service';

// Define interfaces for type safety
export interface ServicePlan {
  id: string;
  name: string;
  price: number;
  active: boolean;
  features?: string[]; // Optional features property for UI
}

export interface AddOn {
  id: string;
  name: string;
  price: number;
  active: boolean;
}

export interface Booking {
  id: string;
  userId: string;
  carId: string;
  washPackage: string;
  status: string;
  location: string;
  notes?: string;
  scheduledTime?: string;
  paymentStatus?: string;
  totalAmount?: number;
  transactionId?: string;
  reviewId?: string;
  washerId?: string;
  acknowledged?: boolean;
  addOnIds?: string[];
  userName?: string;
  promoCode?: string; // <-- Add
}
export interface WasherBooking {
  id: string;
  userId: string;
  userName: string;
  carId: string;
  washPackage: string;
  status: string;
  location: string;
  notes?: string;
  scheduledTime?: string;
  paymentStatus?: string;
  acknowledged?: boolean;
  washerId?: string;
  transactionId?: string;
  totalAmount?: number;
  promoCode?: string;
  addOnIds?: string[];
  reviewId?: string;
  version?: number;
  receiptGenerated?: boolean;
}

export interface WasherReport {
  washerId: string;
  totalEarnings: number;
  totalAcceptedOrders: number;
  totalCompletedOrders: number;
  date?: string;
}

export interface BookingResponse {
  booking: Booking;
  promoCodeApplied?: string;
}

@Injectable({
  providedIn: 'root',
})
export class BookingService {
  private apiUrl = '/api/bookings';
  private userApiUrl = '/api/users';
  private servicePlanApiUrl = '/api/service-plans';
  private addOnApiUrl = '/api/add-ons';
  private receiptApiUrl = '/api/receipt'; 

  constructor(private http: HttpClient, private userService: UserService) {}

  private getHeaders(): HttpHeaders {
    const headers = this.userService.getHeaders();
    console.log('Request headers:', headers.get('Authorization'));
    return headers;
  }

  getServicePlans(): Observable<ServicePlan[]> {
    return this.http
      .get<ServicePlan[]>(this.servicePlanApiUrl, { headers: this.getHeaders() })
      .pipe(
        tap(response => console.log('✅ Service plans response:', response)),
        catchError(this.handleError)
      );
  }

  createServicePlan(servicePlan: Partial<ServicePlan>): Observable<ServicePlan> {
    return this.http
      .post<ServicePlan>(this.servicePlanApiUrl, servicePlan, { headers: this.getHeaders() })
      .pipe(
        tap(response => console.log('✅ Created service plan response:', response)),
        catchError(this.handleError)
      );
  }

  updateServicePlan(id: string, servicePlan: Partial<ServicePlan>): Observable<ServicePlan> {
    return this.http
      .put<ServicePlan>(`${this.servicePlanApiUrl}/${id}`, servicePlan, { headers: this.getHeaders() })
      .pipe(
        tap(response => console.log('✅ Updated service plan response:', response)),
        catchError(this.handleError)
      );
  }

  toggleServicePlanStatus(id: string, active: boolean): Observable<void> {
    // Backend expects a raw boolean, not an object
    return this.http
      .patch<void>(`${this.servicePlanApiUrl}/${id}/toggle`, active, { headers: this.getHeaders() })
      .pipe(
        tap(() => console.log(`✅ Toggled service plan ${id} status to ${active}`)),
        catchError(this.handleError)
      );
  }

  deleteServicePlan(id: string): Observable<void> {
    return this.http
      .delete<void>(`${this.servicePlanApiUrl}/${id}`, { headers: this.getHeaders() })
      .pipe(
        tap(() => console.log(`✅ Deleted service plan ${id}`)),
        catchError(this.handleError)
      );
  }

  getAddOns(): Observable<AddOn[]> {
    return this.http
      .get<AddOn[]>(this.addOnApiUrl, { headers: this.getHeaders() })
      .pipe(
        tap(response => console.log('✅ Add-ons response:', response)),
        catchError(this.handleError)
      );
  }

  createAddOn(addOn: Partial<AddOn>): Observable<AddOn> {
    return this.http
      .post<AddOn>(this.addOnApiUrl, addOn, { headers: this.getHeaders() })
      .pipe(
        tap(response => console.log('✅ Created add-on response:', response)),
        catchError(this.handleError)
      );
  }

  updateAddOn(id: string, addOn: Partial<AddOn>): Observable<AddOn> {
    return this.http
      .put<AddOn>(`${this.addOnApiUrl}/${id}`, addOn, { headers: this.getHeaders() })
      .pipe(
        tap(response => console.log('✅ Updated add-on response:', response)),
        catchError(this.handleError)
      );
  }

  toggleAddOnStatus(id: string, active: boolean): Observable<void> {
    // Backend expects a raw boolean, not an object
    return this.http
      .patch<void>(`${this.addOnApiUrl}/${id}/toggle`, active, { headers: this.getHeaders() })
      .pipe(
        tap(() => console.log(`✅ Toggled add-on ${id} status to ${active}`)),
        catchError(this.handleError)
      );
  }

  deleteAddOn(id: string): Observable<void> {
    return this.http
      .delete<void>(`${this.addOnApiUrl}/${id}`, { headers: this.getHeaders() })
      .pipe(
        tap(() => console.log(`✅ Deleted add-on ${id}`)),
        catchError(this.handleError)
      );
  }

  createBooking(booking: Partial<Booking>): Observable<BookingResponse> {
    return this.http
      .post<BookingResponse>(`${this.apiUrl}/create`, booking, { headers: this.getHeaders() })
      .pipe(
        tap(response => console.log('✅ Created booking response:', response)),
        catchError(this.handleError)
      );
  }

  applyPromoCode(promoCode: string, baseAmount: number): Observable<any> {
    return this.http
      .post(`${this.apiUrl}/apply-promo`, { promoCode, baseAmount }, { headers: this.getHeaders() })
      .pipe(
        tap(response => console.log('✅ Promo code response:', response)),
        catchError(this.handleError)
      );
  }

  getBookingHistory(userId: string): Observable<Booking[]> {
    console.log('Fetching booking history for userId:', userId);
    return this.http
      .get<Booking[]>(`${this.apiUrl}?userId=${userId}`, {
        headers: this.getHeaders(),
      })
      .pipe(
        tap(response => console.log('✅ Booking history response:', response)),
        catchError(this.handleError)
      );
  }

  cancelBooking(bookingId: string, userId: string, reason: string): Observable<void> {
    return this.http
      .post<void>(`${this.apiUrl}/cancel/${bookingId}`, { reason }, {
        headers: this.getHeaders(),
        params: { userId }
      })
      .pipe(
        tap(() => console.log(`✅ Canceled booking ${bookingId}`)),
        catchError(this.handleError)
      );
  }

  declineBooking(bookingId: string, washerId: string, reason: string): Observable<void> {
    return this.http
      .post<void>(`${this.apiUrl}/${bookingId}/decline`, { reason }, {
        headers: this.getHeaders(),
        params: { washerId }
      })
      .pipe(
        tap(() => console.log(`✅ Declined booking ${bookingId}`)),
        catchError(this.handleError)
      );
  }

 getWasherRequests(washerId: string): Observable<WasherBooking[]> {
  console.log(`Fetching washer requests: ${this.apiUrl}/washer/${washerId}/requests`);
  return this.http
    .get<WasherBooking[]>(`${this.apiUrl}/washer/${washerId}/requests`, {
      headers: this.getHeaders(),
    })
    .pipe(
      map(response => response || []), // Convert null (from 204) to empty array
      tap(response => console.log('✅ Washer requests response:', response)),
      catchError(this.handleError)
    );
}

  getWasherBookingsForAdmin(washerId: string): Observable<Booking[]> {
    console.log(`Fetching admin washer bookings: ${this.apiUrl}/admin/washer/${washerId}`);
    return this.http
      .get<Booking[]>(`${this.apiUrl}/admin/washer/${washerId}`, {
        headers: this.getHeaders(),
      })
      .pipe(
        tap((bookings) => console.log(`✅ Admin washer bookings response:`, bookings)),
        catchError(this.handleError)
      );
  }

  getCurrentOrders(washerId: string): Observable<WasherBooking[]> {
    return this.http
      .get<WasherBooking[]>(`${this.apiUrl}/washer/${washerId}/current-orders`, {
        headers: this.getHeaders(),
      })
      .pipe(
        map(response => response || []), // Convert null (from 204) to empty array
        tap(response => console.log('✅ Current orders response:', response)),
        catchError(this.handleError)
      );
  }

  getPastOrders(washerId: string): Observable<WasherBooking[]> {
    return this.http
      .get<WasherBooking[]>(`${this.apiUrl}/washer/${washerId}/past-orders`, {
        headers: this.getHeaders(),
      })
      .pipe(
        tap(response => console.log('✅ Past orders response:', response)),
        catchError(this.handleError)
      );
  }

  acceptBooking(bookingId: string, washerId: string): Observable<void> {
    return this.http
      .post<void>(
        `${this.apiUrl}/accept/${bookingId}`,
        null,
        {
          headers: this.getHeaders(),
          params: { washerId },
        }
      )
      .pipe(catchError(this.handleError));
  }

  acknowledgeBooking(bookingId: string, washerId: string): Observable<void> {
    return this.http
      .post<void>(
        `${this.apiUrl}/${bookingId}/acknowledge`,
        null,
        {
          headers: this.getHeaders(),
          params: { washerId },
        }
      )
      .pipe(
        tap(() => console.log(`✅ Acknowledged booking ${bookingId} by washer ${washerId}`)),
        catchError(this.handleError)
      );
  }

  assignBooking(bookingId: string, washerId: string): Observable<void> {
    return this.http
      .post<void>(
        `${this.apiUrl}/${bookingId}/assign`,
        null,
        {
          headers: this.getHeaders(),
          params: { washerId },
        }
      )
      .pipe(
        tap(() => console.log(`✅ Assigned booking ${bookingId} to washer ${washerId}`)),
        catchError(this.handleError)
      );
  }

  startProcessing(bookingId: string, washerId: string): Observable<void> {
    return this.http
      .put<void>(
        `${this.apiUrl}/${bookingId}/start-processing`,
        null,
        {
          headers: this.getHeaders(),
          params: { washerId },
        }
      )
      .pipe(
        tap(() => console.log(`✅ Started processing booking ${bookingId} by washer ${washerId}`)),
        catchError(this.handleError)
      );
  }

  completeBooking(bookingId: string): Observable<void> {
    return this.http
      .post<void>(`${this.apiUrl}/${bookingId}/complete`, null, {
        headers: this.getHeaders(),
      })
      .pipe(
        tap(() => console.log(`✅ Completed booking ${bookingId}`)),
        catchError(this.handleError)
      );
  }

  getAvailableWashers(): Observable<User[]> {
    return this.http
      .get<User[]>(`${this.userApiUrl}/role/WASHER`, {
        headers: this.getHeaders(),
      })
      .pipe(
        tap(response => console.log('✅ Available washers response:', response)),
        catchError(this.handleError)
      );
  }

  getBookingById(bookingId: string): Observable<Booking> {
    return this.http
      .get<Booking>(`${this.apiUrl}/${bookingId}`, {
        headers: this.getHeaders(),
      })
      .pipe(
        tap(response => console.log('✅ Booking by ID response:', response)),
        catchError(this.handleError)
      );
  }

  getAllBookings(): Observable<Booking[]> {
    console.log('Fetching bookings from:', `${this.apiUrl}/all`);
    return this.http
      .get<{bookings: Booking[]}>(`${this.apiUrl}/all`, {
        headers: this.getHeaders(),
      })
      .pipe(
        map(response => response.bookings || []),
        tap((bookings) => console.log('✅ Bookings response:', bookings)),
        catchError(this.handleError)
      );
  }

  getWasherReport(washerId: string): Observable<WasherReport> {
    return this.http
      .get<WasherReport>(`${this.apiUrl}/washer/${washerId}/report`, {
        headers: this.getHeaders(),
      })
      .pipe(
        tap(response => console.log('✅ Washer report response:', response)),
        catchError(this.handleError)
      );
  }
uploadAfterWashPhoto(
    bookingId: string,
    file: File,
    userId: string,
    washerId: string,
    carModel: string,
    packageName: string,
    addOns: string,
    totalAmount: number,
    transactionId: string
  ): Observable<any> {
    console.log('Sending request to generate invoice for bookingId:', bookingId, 'File size:', file.size);
    const formData = new FormData();
    formData.append('image', file);
    formData.append('userId', userId);
    formData.append('washerId', washerId);
    formData.append('carModel', carModel);
    formData.append('packageName', packageName);
    formData.append('addOns', addOns);
    formData.append('totalAmount', totalAmount.toString());
    formData.append('transactionId', transactionId);

    // Create headers with only Authorization
    const token = this.userService.getHeaders().get('Authorization');
    const headers = new HttpHeaders({
      Authorization: token || '',
    });

    return this.http
      .post(`${this.receiptApiUrl}/upload/${bookingId}`, formData, { headers })
      .pipe(
        tap(response => console.log('✅ Invoice upload response:', response)),
        catchError(this.handleError)
      );
  }

  private handleError(error: any): Observable<never> {
    console.error('BookingService Error:', {
      status: error.status,
      statusText: error.statusText,
      url: error.url,
      message: error.message,
      error: error.error,
    });
    let errorMessage = 'Failed to process booking request: ' + (error.message || 'Unknown error');
    if (error.status === 400) {
      errorMessage = error.error?.error || 'Invalid request: Check booking status or input data.';
    } else if (error.status === 403) {
      errorMessage = 'Permission denied: Ensure you have the correct role (e.g., ADMIN or WASHER).';
    } else if (error.status === 404) {
      errorMessage = error.error?.error || 'Resource not found: Booking or washer does not exist.';
    } else if (error.status === 500 && typeof error.error === 'string' && error.error.includes('MultipartException')) {
      errorMessage = 'Invalid multipart request: Ensure the file and form data are correctly formatted.';
    }
    return throwError(() => new Error(errorMessage));
  }
}