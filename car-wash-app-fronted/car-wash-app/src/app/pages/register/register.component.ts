import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { AuthService } from '../../services/auth.service';

interface RegisterUser {
  name: string;
  email: string;
  password: string;
  phone: string;
  role: string;
}

@Component({
  selector: 'app-register',
  standalone: true,
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.scss'],
  imports: [FormsModule, CommonModule, RouterModule]
})
export class RegisterComponent {
  user: RegisterUser = { name: '', email: '', password: '', phone: '', role: 'CUSTOMER' };
  formErrors: { [key: string]: string } = {};
  showPassword = false;
  isLoading = false;


  constructor(private authService: AuthService) {}

  register() {
    this.formErrors = {};
    let isValid = true;

    // Validate all fields and collect errors
    if (!this.user.name || this.user.name.length < 2) {
      this.formErrors['name'] = 'Full name must be at least 2 characters';
      isValid = false;
    }
    if (!this.user.email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(this.user.email)) {
      this.formErrors['email'] = 'Invalid email format';
      isValid = false;
    }
    if (!this.user.password || this.user.password.length < 8) {
      this.formErrors['password'] = 'Password must be at least 8 characters long';
      isValid = false;
    }
    if (!this.user.phone || !/^\d{10}$/.test(this.user.phone)) {
      this.formErrors['phone'] = 'Phone number must be exactly 10 digits';
      isValid = false;
    }
    if (!this.user.role || !['CUSTOMER', 'WASHER'].includes(this.user.role)) {
      this.formErrors['role'] = 'Please select a valid role';
      isValid = false;
    }

    // Only proceed with registration if form is valid
    if (!isValid) {
      return;
    }

    this.isLoading = true;
    this.authService.register(this.user)
      .subscribe({
        next: (response) => {
          this.isLoading = false;
          console.log('✅ Registration successful:', response);
          alert('Registration successful! Please login to continue.');
          // Optionally redirect to login page
          // this.router.navigate(['/login']);
        },
        error: (error) => {
          this.isLoading = false;
          console.error('❌ Registration failed:', error);
          if (error.error && typeof error.error === 'object') {
            // Handle backend validation errors
            Object.keys(error.error).forEach(key => {
              this.formErrors[key] = error.error[key];
            });
          } else {
            this.formErrors['general'] = error.error?.message || error.error?.error || 'Registration failed. Please try again.';
          }
        }
      });
  }

  googleSignIn() {
    window.location.href = 'http://localhost:8080/oauth2/authorization/google?redirect_uri=http://localhost:4200/home';
  }

  facebookSignIn() {
    window.location.href = 'http://localhost:8080/oauth2/authorization/facebook?redirect_uri=http://localhost:4200/home';
  }

  toggleShowPassword() {
    this.showPassword = !this.showPassword;
  }


}
