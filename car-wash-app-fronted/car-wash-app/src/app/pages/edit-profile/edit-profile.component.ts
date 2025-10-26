import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { UserService } from '../../services/user.service';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatTooltipModule } from '@angular/material/tooltip';
import { HttpErrorResponse } from '@angular/common/http';

interface User {
  id: string;
  fullName: string;
  email: string;
  phone?: string;
  role: string;
  profilePicture?: string;
  active?: boolean;
}

@Component({
  selector: 'app-edit-profile',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule,
    MatTooltipModule,
  ],
  templateUrl: './edit-profile.component.html',
  styleUrls: ['./edit-profile.component.scss'],
})
export class EditProfileComponent implements OnInit {
  editForm: FormGroup;
  user: User = { id: '', fullName: '', email: '', role: '' };
  previewImage: string | null = null;
  selectedFile: File | null = null;
  loading = true;
  errorMessage = '';
  successMessage = '';
  isNewWasher = false;
  private backendBaseUrl = 'http://localhost:8080'; // Backend base URL

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private userService: UserService,
    private router: Router
  ) {
    this.editForm = this.fb.group({
      fullName: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      phone: [''],
      profilePicture: [''],
      role: [''],
      active: [true],
      password: [''],
    });
  }

  ngOnInit() {
    const userId = this.authService.getUserId();
    this.isNewWasher = history.state.isNewWasher || false;

    if (this.isNewWasher) {
      console.log('Creating new washer');
      this.user = { id: '', fullName: '', email: '', role: 'WASHER', active: true };
      this.editForm.patchValue({ role: 'WASHER', active: true });
      this.editForm.get('password')?.setValidators([Validators.required, Validators.minLength(6)]);
      this.loading = false;
      return;
    }

    if (!userId) {
      console.warn('No user ID provided, redirecting to login');
      this.router.navigate(['/login']);
      return;
    }

    if (this.authService.getUserRole() === 'ADMIN') {
      const stateUser = history.state.user as User;
      if (stateUser && stateUser.id) {
        console.log('Loading user from state:', stateUser);
        this.user = stateUser;
        this.editForm.patchValue({
          fullName: stateUser.fullName,
          email: stateUser.email,
          phone: stateUser.phone || '',
          profilePicture: stateUser.profilePicture || '',
          role: stateUser.role,
          active: stateUser.active ?? true,
        });
        this.previewImage = this.getProfilePictureUrl(stateUser.profilePicture);
        this.loading = false;
      } else {
        console.log('Fetching user by ID:', userId);
        this.userService.getUserById(userId).subscribe({
          next: (profile: User) => {
            this.user = profile;
            this.editForm.patchValue({
              fullName: profile.fullName,
              email: profile.email,
              phone: profile.phone || '',
              profilePicture: profile.profilePicture || '',
              role: profile.role,
              active: profile.active ?? true,
            });
            this.previewImage = this.getProfilePictureUrl(profile.profilePicture);
            this.loading = false;
          },
          error: (err: HttpErrorResponse) => {
            console.error('Error fetching user:', err);
            this.errorMessage = 'Failed to load profile: ' + err.message;
            this.loading = false;
          },
        });
      }
    } else {
      console.log('Loading current user profile');
      this.authService.getUserProfile().subscribe({
        next: (profile: User) => {
          this.user = profile;
          this.editForm.patchValue({
            fullName: profile.fullName,
            email: profile.email,
            phone: profile.phone || '',
            profilePicture: profile.profilePicture || '',
            role: profile.role,
            active: profile.active ?? true,
          });
          this.previewImage = this.getProfilePictureUrl(profile.profilePicture);
          this.loading = false;
        },
        error: (err: HttpErrorResponse) => {
          console.error('Error fetching profile:', err);
          this.errorMessage = 'Failed to load profile: ' + err.message;
          this.loading = false;
          if (err.status === 401) {
            this.router.navigate(['/login']);
          }
        },
      });
    }
  }

  onFileChange(event: Event) {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files[0]) {
      this.selectedFile = input.files[0];
      const reader = new FileReader();
      reader.onload = () => {
        this.previewImage = reader.result as string;
        this.editForm.patchValue({ profilePicture: '' }); // Clear for file upload
        this.editForm.markAsDirty();
      };
      reader.readAsDataURL(this.selectedFile);
    }
  }

  onUrlChange(event: Event) {
    const input = event.target as HTMLInputElement;
    this.previewImage = input.value || null;
    this.selectedFile = null;
    this.editForm.patchValue({ profilePicture: input.value || '' });
    this.editForm.markAsDirty();
  }

  onSubmit() {
    if (this.editForm.valid) {
      this.loading = true;
      this.errorMessage = '';
      this.successMessage = '';

      const updatedUser: User & { password?: string } = {
        ...this.user,
        ...this.editForm.value,
      };

      if (this.selectedFile) {
        const formData = new FormData();
        formData.append('file', this.selectedFile); // Fix: append the file
        formData.append('userId', this.user.id || 'new');

        this.userService.uploadProfilePicture(formData).subscribe({
          next: (response: any) => {
            updatedUser.profilePicture = response.url ? `${this.backendBaseUrl}${response.url}` : '';
            console.log('Profile picture URL after upload:', updatedUser.profilePicture);
            this.previewImage = this.getProfilePictureUrl(updatedUser.profilePicture);
            this.saveUser(updatedUser);
          },
          error: (err: HttpErrorResponse) => {
            console.error('Upload error:', err);
            let picValue = this.editForm.get('profilePicture')?.value || this.user.profilePicture || '';
            if (picValue.startsWith(this.backendBaseUrl + '/Uploads/')) {
              picValue = picValue.replace(this.backendBaseUrl, '');
            }
            updatedUser.profilePicture = picValue;
            this.loading = false;
          },
        });
      } else {
        updatedUser.profilePicture = this.editForm.get('profilePicture')?.value || this.user.profilePicture || '';
        console.log('Profile picture URL for update:', updatedUser.profilePicture);
        this.previewImage = this.getProfilePictureUrl(updatedUser.profilePicture);
        this.saveUser(updatedUser);
      }
    }
  }

  private saveUser(updatedUser: User & { password?: string }) {
    if (this.isNewWasher) {
      this.userService.createUser(updatedUser).subscribe({
        next: (response: any) => {
          this.successMessage = 'Washer created successfully!';
          this.loading = false;
          setTimeout(() => this.router.navigate(['/admin-dashboard']), 2000);
        },
        error: (err: HttpErrorResponse) => {
          console.error('Create error:', err);
          this.errorMessage = 'Failed to create washer: ' + err.message;
          this.loading = false;
        },
      });
    } else {
      delete updatedUser.password;
      this.userService.updateUser(this.user.id, updatedUser).subscribe({
        next: () => {
          // Always update the UI with the just-saved value
          this.user = { ...this.user, ...updatedUser };
          this.previewImage = this.getProfilePictureUrl(updatedUser.profilePicture);
          this.successMessage = 'Profile updated successfully!';
          this.loading = false;
          setTimeout(() => this.router.navigate(['/profile']), 2000);
        },
        error: (err: HttpErrorResponse) => {
          console.error('Update error:', err, 'Status:', err.status, 'Message:', err.message);
          this.errorMessage = 'Failed to update profile: ' + err.message;
          if (err.status === 401) {
            console.log('Unauthorized access attempt, redirecting to home');
            this.router.navigate(['/home']);
          }
          this.loading = false;
        },
      });
    }
  }

  goBack() {
    this.router.navigate(['/profile']);
  }

  private getProfilePictureUrl(profilePicture?: string): string {
    if (!profilePicture) {
      return 'assets/profile-placeholder.png';
    }
    if (profilePicture.startsWith('/Uploads/')) {
      // If the image is missing on the server, fallback to placeholder
      return `${this.backendBaseUrl}${profilePicture}`;
    }
    // If the path is not a URL or /Uploads/, fallback
    if (!profilePicture.startsWith('http')) {
      return 'assets/profile-placeholder.png';
    }
    return profilePicture; // Use external URLs (e.g., Bing) directly
  }
}