import { Injectable, Inject, PLATFORM_ID } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Router } from '@angular/router';
import { Observable, BehaviorSubject, throwError } from 'rxjs';
import { tap, catchError } from 'rxjs/operators';
import { isPlatformBrowser } from '@angular/common';

interface User {
  id: string;
  fullName: string;
  email: string;
  phone?: string;
  role: string;
  profilePicture?: string;
}

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private apiUrl = '/api/auth';
  private oauth2RedirectUrl = 'http://localhost:8081/oauth2/authorization';
  private authStatus = new BehaviorSubject<boolean>(this.hasToken());

  constructor(
    private http: HttpClient,
    private router: Router,
    @Inject(PLATFORM_ID) private platformId: object
  ) {}

  private hasToken(): boolean {
    return isPlatformBrowser(this.platformId) && !!localStorage.getItem('token');
  }

  get isAuthenticated$(): Observable<boolean> {
    return this.authStatus.asObservable();
  }

  login(credentials: { email: string; password: string }): Observable<any> {
    return this.http.post(`${this.apiUrl}/login`, credentials).pipe(
      tap((response: any) => {
        console.log('AuthService login response:', response);
        if (response?.token) {
          localStorage.setItem('token', response.token);
          localStorage.setItem('userId', response.userId || credentials.email);
          localStorage.setItem('role', response.role || '');
          this.authStatus.next(true);
          console.log('✅ Stored token:', response.token, 'userId:', response.userId || credentials.email, 'response.userId:', response.userId);
        }
      }),
      catchError((error) => {
        console.error('❌ Login error:', error);
        throw error;
      })
    );
  }

  register(user: { name: string; email: string; password: string; phone?: string }): Observable<any> {
    return this.http.post(`${this.apiUrl}/register`, user).pipe(
      tap((response: any) => {
        console.log('AuthService register response:', response);
        if (response?.token) {
          localStorage.setItem('token', response.token);
          localStorage.setItem('userId', response.userId || user.email); // Prefer userId
          localStorage.setItem('role', response.role || '');
          this.authStatus.next(true);
          console.log('✅ Stored token:', response.token, 'userId:', response.userId || user.email);
        }
      }),
      catchError((error) => {
        console.error('❌ Registration error:', error);
        throw error;
      })
    );
  }

  loginWithGoogle(): void {
    if (isPlatformBrowser(this.platformId)) {
      window.location.href = `${this.oauth2RedirectUrl}/google`;
    }
  }

  loginWithFacebook(): void {
    if (isPlatformBrowser(this.platformId)) {
      window.location.href = `${this.oauth2RedirectUrl}/facebook`;
    }
  }

  handleOAuthRedirect(): void {
    if (isPlatformBrowser(this.platformId)) {
      const urlParams = new URLSearchParams(window.location.search);
      const token = urlParams.get('token');
      const userId = urlParams.get('userId');
      const role = urlParams.get('role');
      if (token) {
        localStorage.setItem('token', token);
        if (userId) localStorage.setItem('userId', userId);
        if (role) localStorage.setItem('role', role);
        this.authStatus.next(true);
        window.history.replaceState({}, document.title, '/home');
        console.log('✅ OAuth redirect handled, token:', token, 'userId:', userId);
      }
    }
  }

  logout(): void {
    if (isPlatformBrowser(this.platformId)) {
      localStorage.removeItem('token');
      localStorage.removeItem('userId');
      localStorage.removeItem('role');
      this.authStatus.next(false);
      this.router.navigate(['/login']);
      console.log('✅ Logged out');
    }
  }

  getToken(): string | null {
    return isPlatformBrowser(this.platformId) ? localStorage.getItem('token') : null;
  }

  getUserId(): string | null {
    return isPlatformBrowser(this.platformId) ? localStorage.getItem('userId') : null;
  }

  getUserRole(): string | null {
    return isPlatformBrowser(this.platformId) ? localStorage.getItem('role') : null;
  }

  isAuthenticated(): boolean {
    return this.hasToken();
  }

  getUserProfile(): Observable<User> {
    const userId = this.getUserId();
    if (!userId) {
      return throwError(() => new Error('No user ID found'));
    }
    return this.http.get<User>(`/api/users/id/${userId}`, { headers: this.getHeaders() }).pipe(
      tap((profile) => console.log('✅ User profile fetched:', profile)),
      catchError((error) => {
        console.error('❌ Error fetching user profile:', error);
        return throwError(() => error);
      })
    );
  }

  updateProfile(user: User): Observable<User> {
    const userId = this.getUserId();
    const token = this.getToken();
    console.log('Updating profile for userId:', userId, 'with token:', token);
    return this.http.put<User>(`/api/users/${user.id}`, user, { headers: this.getHeaders() }).pipe(
      tap((updatedUser) => console.log('✅ Profile updated:', updatedUser)),
      catchError((error) => {
        console.error('❌ Error updating profile:', error, 'Status:', error.status, 'Message:', error.message);
        throw error;
      })
    );
  }

  uploadProfilePicture(file: File, userId: string): Observable<any> {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('userId', userId);
    return this.http.post(`/api/users/upload-profile-picture`, formData, { headers: this.getHeaders() }).pipe(
      tap((response) => console.log('✅ Profile picture uploaded:', response)),
      catchError((error) => {
        console.error('❌ Error uploading profile picture:', error);
        throw error;
      })
    );
  }

  private getHeaders(): HttpHeaders {
    const token = this.getToken();
    console.log('Sending Authorization header with token:', token);
    return token
      ? new HttpHeaders({ 'Authorization': `Bearer ${token}` })
      : new HttpHeaders();
  }
}