
// import { Injectable, Inject, PLATFORM_ID } from '@angular/core';
// import { HttpClient, HttpHeaders, HttpErrorResponse } from '@angular/common/http';
// import { Observable, throwError } from 'rxjs';
// import { catchError, tap } from 'rxjs/operators';
// import { isPlatformBrowser } from '@angular/common';

// export interface User {
//   id: string;
//   fullName: string;
//   email: string;
//   phone?: string;
//   role: string;
//   active: boolean;
//   serviceStatus?: string;
//   profilePicture?: string; // Explicitly include profilePicture
// }

// @Injectable({
//   providedIn: 'root',
// })
// export class UserService {
//   private apiUrl = '/api/users';

//   constructor(
//     private http: HttpClient,
//     @Inject(PLATFORM_ID) private platformId: Object
//   ) {}

//   getHeaders(): HttpHeaders {
//     let token: string | null = null;
//     if (isPlatformBrowser(this.platformId)) {
//       token = localStorage.getItem('token');
//       console.log('UserService token:', token ? token : 'Missing');
//     }
//     return new HttpHeaders({
//       'Content-Type': 'application/json',
//       Authorization: token ? `Bearer ${token}` : '',
//     });
//   }

//   getHeadersForUpload(): HttpHeaders {
//     let token: string | null = null;
//     if (isPlatformBrowser(this.platformId)) {
//       token = localStorage.getItem('token');
//       console.log('UserService upload token:', token ? token : 'Missing');
//     }
//     return new HttpHeaders({
//       Authorization: token ? `Bearer ${token}` : '',
//     });
//   }

//   getCurrentUserId(): string {
//     if (isPlatformBrowser(this.platformId)) {
//       const userId = localStorage.getItem('userId') || '';
//       console.log('UserService getCurrentUserId:', userId);
//       return userId;
//     }
//     return '';
//   }

//   getCurrentUserRole(): string {
//     if (isPlatformBrowser(this.platformId)) {
//       const role = localStorage.getItem('role') || '';
//       console.log('UserService getCurrentUserRole:', role);
//       return role;
//     }
//     return '';
//   }

//   createUser(user: Partial<User>): Observable<User> {
//     console.log('Creating user with payload:', user);
//     return this.http
//       .post<User>(this.apiUrl, user, { headers: this.getHeaders() })
//       .pipe(
//         tap((response) => console.log('Create user response:', response)),
//         catchError(this.handleError)
//       );
//   }

//   getUserById(id: string): Observable<User> {
//     console.log('Fetching user by ID:', id);
//     return this.http
//       .get<User>(`${this.apiUrl}/id/${id}`, { headers: this.getHeaders() })
//       .pipe(
//         tap((response) => console.log('Get user by ID response:', response)),
//         catchError(this.handleError)
//       );
//   }

//   updateUser(id: string, user: Partial<User>): Observable<User> {
//     const token = isPlatformBrowser(this.platformId) ? localStorage.getItem('token') : null;
//     console.log('Updating user ID:', id, 'with payload:', user, 'profilePicture:', user.profilePicture, 'token:', token ? token : 'Missing');
//     return this.http
//       .put<User>(`${this.apiUrl}/${id}`, user, { headers: this.getHeaders() })
//       .pipe(
//         tap((response) => console.log('Update user response:', response, 'profilePicture:', response.profilePicture)),
//         catchError(this.handleError)
//       );
//   }

//   uploadProfilePicture(formData: FormData): Observable<any> {
//     const token = isPlatformBrowser(this.platformId) ? localStorage.getItem('token') : null;
//     console.log('Uploading profile picture with token:', token ? token : 'Missing');
//     return this.http
//       .post(`${this.apiUrl}/upload-profile-picture`, formData, {
//         headers: this.getHeadersForUpload(),
//       })
//       .pipe(
//         tap((response) => console.log('Upload profile picture response:', response)),
//         catchError(this.handleError)
//       );
//   }

//   getUsersByRole(role: string): Observable<User[]> {
//     console.log('Fetching users by role:', role);
//     return this.http
//       .get<User[]>(`${this.apiUrl}/role/${role}`, {
//         headers: this.getHeaders(),
//       })
//       .pipe(
//         tap((response) => console.log(`Get users by role (${role}) response:`, response)),
//         catchError(this.handleError)
//       );
//   }

//   updateServiceStatus(userId: string, status: string): Observable<User> {
//     const payload = { serviceStatus: status };
//     console.log('Updating service status for user ID:', userId, 'with payload:', payload);
//     return this.http
//       .put<User>(`${this.apiUrl}/${userId}/service-status`, payload, {
//         headers: this.getHeaders(),
//       })
//       .pipe(
//         tap((response) => console.log('Update service status response:', response)),
//         catchError(this.handleError)
//       );
//   }

//   private handleError(error: HttpErrorResponse): Observable<never> {
//     console.error('UserService Error:', {
//       status: error.status,
//       statusText: error.statusText,
//       url: error.url,
//       message: error.message,
//       error: error.error,
//     });
//     let errorMessage = 'Failed to process user request';
//     if (error.status === 409) {
//       errorMessage = 'Email is already registered';
//     } else if (error.status === 403) {
//       errorMessage = 'You do not have permission to perform this action';
//     } else if (error.status === 401) {
//       errorMessage = 'Unauthorized - please log in again';
//     } else if (error.status === 400) {
//       errorMessage = 'Invalid input data';
//     } else if (error.status === 404) {
//       errorMessage = 'Resource not found';
//     } else if (error.status === 0) {
//       errorMessage = 'Network error - check backend server';
//     } else if (error.message.includes('Unexpected token')) {
//       errorMessage = 'Server returned an unexpected response - check endpoint';
//     } else {
//       errorMessage += `: ${error.statusText || 'Unknown error'}`;
//     }
//     return throwError(() => new Error(errorMessage));
//   }
// }

import { Injectable, Inject, PLATFORM_ID } from '@angular/core';
import { HttpClient, HttpHeaders, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, tap } from 'rxjs/operators';
import { isPlatformBrowser } from '@angular/common';

// Define UsersResponse interface
export interface UsersResponse {
  users: User[];
}

export interface User {
  id: string;
  fullName: string;
  email: string;
  phone?: string;
  role: string;
  active: boolean;
  serviceStatus?: string;
  profilePicture?: string;
  reviewsGiven?: any[]; // Adjust type as needed (e.g., Review[] if Review interface exists)
  reviewsReceived?: any[];
}

@Injectable({
  providedIn: 'root',
})
export class UserService {
  private apiUrl = '/api/users';

  constructor(
    private http: HttpClient,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {}

  getHeaders(): HttpHeaders {
    let token: string | null = null;
    if (isPlatformBrowser(this.platformId)) {
      token = localStorage.getItem('token');
      console.log('UserService token:', token ? token : 'Missing');
    }
    return new HttpHeaders({
      'Content-Type': 'application/json',
      Authorization: token ? `Bearer ${token}` : '',
    });
  }

  getHeadersForUpload(): HttpHeaders {
    let token: string | null = null;
    if (isPlatformBrowser(this.platformId)) {
      token = localStorage.getItem('token');
      console.log('UserService upload token:', token ? token : 'Missing');
    }
    return new HttpHeaders({
      Authorization: token ? `Bearer ${token}` : '',
    });
  }

  getCurrentUserId(): string {
    if (isPlatformBrowser(this.platformId)) {
      const userId = localStorage.getItem('userId') || '';
      console.log('UserService getCurrentUserId:', userId);
      return userId;
    }
    return '';
  }

  getCurrentUserRole(): string {
    if (isPlatformBrowser(this.platformId)) {
      const role = localStorage.getItem('role') || '';
      console.log('UserService getCurrentUserRole:', role);
      return role;
    }
    return '';
  }

  createUser(user: Partial<User>): Observable<User> {
    console.log('Creating user with payload:', user);
    return this.http
      .post<User>(this.apiUrl, user, { headers: this.getHeaders() })
      .pipe(
        tap((response) => console.log('Create user response:', response)),
        catchError(this.handleError)
      );
  }

  getUserById(id: string): Observable<User> {
    console.log('Fetching user by ID:', id);
    return this.http
      .get<User>(`${this.apiUrl}/id/${id}`, { headers: this.getHeaders() })
      .pipe(
        tap((response) => console.log('Get user by ID response:', response)),
        catchError(this.handleError)
      );
  }

  updateUser(id: string, user: Partial<User>): Observable<User> {
    const token = isPlatformBrowser(this.platformId) ? localStorage.getItem('token') : null;
    console.log('Updating user ID:', id, 'with payload:', user, 'profilePicture:', user.profilePicture, 'token:', token ? token : 'Missing');
    return this.http
      .put<User>(`${this.apiUrl}/${id}`, user, { headers: this.getHeaders() })
      .pipe(
        tap((response) => console.log('Update user response:', response, 'profilePicture:', response.profilePicture)),
        catchError(this.handleError)
      );
  }

  uploadProfilePicture(formData: FormData): Observable<any> {
    const token = isPlatformBrowser(this.platformId) ? localStorage.getItem('token') : null;
    console.log('Uploading profile picture with token:', token ? token : 'Missing');
    return this.http
      .post(`${this.apiUrl}/upload-profile-picture`, formData, {
        headers: this.getHeadersForUpload(),
      })
      .pipe(
        tap((response) => console.log('Upload profile picture response:', response)),
        catchError(this.handleError)
      );
  }

  getUsersByRole(role: string): Observable<UsersResponse> {
    console.log('Fetching users by role:', role);
    return this.http
      .get<UsersResponse>(`${this.apiUrl}/role/${role}`, {
        headers: this.getHeaders(),
      })
      .pipe(
        tap((response) => console.log(`Get users by role (${role}) response:`, response)),
        catchError(this.handleError)
      );
  }

  updateServiceStatus(userId: string, status: string): Observable<User> {
    const payload = { serviceStatus: status };
    console.log('Updating service status for user ID:', userId, 'with payload:', payload);
    return this.http
      .put<User>(`${this.apiUrl}/${userId}/service-status`, payload, {
        headers: this.getHeaders(),
      })
      .pipe(
        tap((response) => console.log('Update service status response:', response)),
        catchError(this.handleError)
      );
  }

  private handleError(error: HttpErrorResponse): Observable<never> {
    console.error('UserService Error:', {
      status: error.status,
      statusText: error.statusText,
      url: error.url,
      message: error.message,
      error: error.error,
    });
    let errorMessage = 'Failed to process user request';
    if (error.status === 409) {
      errorMessage = 'Email is already registered';
    } else if (error.status === 403) {
      errorMessage = 'You do not have permission to perform this action';
    } else if (error.status === 401) {
      errorMessage = 'Unauthorized - please log in again';
    } else if (error.status === 400) {
      errorMessage = 'Invalid input data';
    } else if (error.status === 404) {
      errorMessage = 'Resource not found';
    } else if (error.status === 0) {
      errorMessage = 'Network error - check backend server';
    } else if (error.message.includes('Unexpected token')) {
      errorMessage = 'Server returned an unexpected response - check endpoint';
    } else {
      errorMessage += `: ${error.statusText || 'Unknown error'}`;
    }
    return throwError(() => new Error(errorMessage));
  }
}