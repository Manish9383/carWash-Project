
import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators, FormGroup } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, MatFormFieldModule, MatInputModule, MatButtonModule, MatProgressSpinnerModule],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss'],
})
export class LoginComponent {
  showPassword = false;
  loading = false;

  loginForm!: FormGroup;

  constructor(private authService: AuthService, private router: Router, private fb: FormBuilder) {
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
    });
  }

  get email() {
    return this.loginForm.get('email');
  }

  get password() {
    return this.loginForm.get('password');
  }

  login() {
    if (this.loginForm.invalid) {
      this.loginForm.markAllAsTouched();
      return;
    }

    this.loading = true;
    const raw = this.loginForm.value as { email?: string | null; password?: string | null };
    const credentials = {
      email: (raw.email || '').toString(),
      password: (raw.password || '').toString(),
    };

    this.authService.login(credentials).subscribe({
      next: (response) => {
        this.loading = false;
        console.log('✅ Login successful:', response);
        if (response && response.token) {
          const role = this.authService.getUserRole();
          if (role === 'WASHER') {
            this.router.navigate(['/washer-dashboard']);
          } else if (role === 'CUSTOMER') {
            this.router.navigate(['/book-service']);
          } else if (role === 'ADMIN') {
            this.router.navigate(['/admin-dashboard']);
          } else {
            this.router.navigate(['/home']);
          }
        } else {
          console.error('❌ No token in response!');
          alert('Login failed: No token received.');
        }
      },
      error: (err) => {
        this.loading = false;
        console.error('❌ Login error:', err);
        alert('Login failed. Please check your credentials.');
      },
    });
  }

  googleSignIn() {
    this.authService.loginWithGoogle();
  }

  facebookSignIn() {
    this.authService.loginWithFacebook();
  }

  toggleShowPassword() {
    this.showPassword = !this.showPassword;
  }
}