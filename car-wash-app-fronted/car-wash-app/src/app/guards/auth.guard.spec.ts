import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private apiUrl = 'http://localhost:8080/api/auth'; //  Backend API URL
  private oauth2RedirectUrl = 'http://localhost:8080/oauth2/authorization'; //  OAuth2 Base URL

  constructor(private http: HttpClient) {}

  // Login with Email & Password
  // login(credentials: { email: string; password: string }): Observable<any> {
  //   return this.http.post(`${this.apiUrl}/login`, credentials);
  // }
  // In your login component
login(credentials: { email: string; password: string }) {
  this.http.post('/api/auth/login', credentials).subscribe({
    next: (response: any) => {
      localStorage.setItem('token', response.token);
      localStorage.setItem('userId', response.userId);
      localStorage.setItem('role', response.role);
    },
    error: (error) => console.error('Login failed:', error)
  });
}

  //  Register User
  register(user: { name: string; email: string; password: string; phone?: string }): Observable<any> {
    return this.http.post(`${this.apiUrl}/register`, user);
  }

  //  OAuth2 Login - Redirects to Backend Auth Provider
  loginWithGoogle(): void {
    window.location.href = `${this.oauth2RedirectUrl}/google`;
  }

  loginWithFacebook(): void {
    window.location.href = `${this.oauth2RedirectUrl}/facebook`;
  }

  //  Logout - Clears token from storage
  logout(): void {
    localStorage.removeItem('token'); // Remove stored token
    localStorage.clear(); // Ensure all localStorage data is removed
    window.location.href = '/login'; //  Redirect to login page
  }

  //  Handle OAuth2 Redirect and Store Token
  handleOAuthRedirect(): void {
    const urlParams = new URLSearchParams(window.location.search);
    const token = urlParams.get('token'); // Extract token from URL

    if (token) {
      localStorage.setItem('token', token); //  Store JWT in localStorage
      window.history.replaceState({}, document.title, '/home'); //  Remove token from URL & Redirect
    }
  }

  // Check if User is Authenticated
  isAuthenticated(): boolean {
    return !!localStorage.getItem('token');
  }
}
