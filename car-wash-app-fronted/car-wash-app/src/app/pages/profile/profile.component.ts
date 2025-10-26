import { Component, OnInit } from '@angular/core';
import { AuthService } from '../../services/auth.service';
import { ReviewService } from '../../services/review.service';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

interface User {
  id: string;
  fullName: string;
  email: string;
  phone?: string;
  role: string;
  profilePicture?: string;
}

interface Review {
  id: string;
  customerId: string;
  customerName: string;
  washerId: string;
  washerName: string;
  bookingId: string;
  rating: number;
  comment?: string;
}

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule, MatButtonModule, MatIconModule, MatProgressSpinnerModule],
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.scss'],
})
export class ProfileComponent implements OnInit {
  user: User | null = null;
  reviewsReceived: Review[] = [];
  reviewsGiven: Review[] = [];
  averageRating: number = 0;
  fiveStarCount: number = 0;
  satisfaction: number = 0;
  error: string | null = null;
  isLoading: boolean = false;
  private backendBaseUrl = 'http://localhost:8080'; // Backend base URL
  private hasImageError = false; // Flag to prevent infinite error loop

  constructor(
    private authService: AuthService,
    private reviewService: ReviewService,
    private router: Router
  ) {}

  ngOnInit() {
    this.loadProfile();
  }

  loadProfile() {
    const userId = this.authService.getUserId();
    if (!userId) {
      this.error = 'User not logged in. Please log in to view your profile.';
      this.router.navigate(['/login']);
      return;
    }

    this.isLoading = true;
    this.authService.getUserProfile().subscribe({
      next: (profile: User) => {
        console.log('Profile loaded:', profile, 'Profile Picture:', profile.profilePicture || 'Not provided');
        this.user = profile;
        this.error = null;
        this.isLoading = false;
        this.hasImageError = false; // Reset error flag on profile load
        this.loadReviews(userId);
      },
      error: (err: any) => {
        console.error('Failed to load profile:', err.message);
        this.error = 'Failed to load profile. Please check your network or try again.';
        this.isLoading = false;
        if (err.status === 401) {
          this.router.navigate(['/login']);
        }
      },
    });
  }

  loadReviews(userId: string) {
    if (this.user?.role === 'WASHER') {
      this.reviewService.getReviewsForWasher(userId).subscribe({
        next: (reviews: Review[]) => {
          this.reviewsReceived = reviews;
          this.calculateAverageRating();
        },
        error: (err: Error) => console.error('Failed to load received reviews:', err.message),
      });
      // For washer, reviewsGiven is same as received (duplicate, but keeping for now)
      this.reviewService.getReviewsForCustomer('').subscribe({
        next: (allReviews: Review[]) => {
          this.reviewsGiven = allReviews.filter(review => review.washerId === userId);
        },
        error: (err: Error) => console.error('Failed to load given reviews:', err.message),
      });
    } else if (this.user?.role === 'CUSTOMER') {
      // For customer, load reviews received from washers
      this.reviewService.getReviewsForCustomer(userId).subscribe({
        next: (reviews: Review[]) => {
          this.reviewsReceived = reviews;
          this.calculateAverageRating();
        },
        error: (err: Error) => console.error('Failed to load received reviews:', err.message),
      });
      // Load reviews given by customer to washers
      this.reviewService.getReviewsGivenByCustomer(userId).subscribe({
        next: (reviews: Review[]) => this.reviewsGiven = reviews,
        error: (err: Error) => console.error('Failed to load given reviews:', err.message),
      });
    } else {
      // For admin or others, no reviews
      this.reviewsReceived = [];
      this.reviewsGiven = [];
    }
  }

  calculateAverageRating(): void {
    if (this.reviewsReceived.length > 0) {
      const total = this.reviewsReceived.reduce((sum: number, r: Review) => sum + r.rating, 0);
      this.averageRating = total / this.reviewsReceived.length;
      this.fiveStarCount = this.reviewsReceived.filter(r => r.rating === 5).length;
      this.satisfaction = Math.round((this.averageRating / 5) * 100);
    } else {
      this.averageRating = 0;
      this.fiveStarCount = 0;
      this.satisfaction = 0;
    }
  }

  getStarArray(rating: number): number[] {
    return Array(Math.floor(rating)).fill(0);
  }

  getEmptyStarArray(rating: number): number[] {
    return Array(5 - Math.floor(rating)).fill(0);
  }

  editProfile(): void {
    this.router.navigate(['/edit-profile']);
  }

  retryLoadProfile(): void {
    this.loadProfile();
  }

  logout(): void {
    this.authService.logout();
  }

  getProfilePictureUrl(profilePicture?: string): string {
    if (!profilePicture) {
      return 'assets/profile-placeholder.png';
    }
    if (profilePicture.startsWith('http')) {
      // If full URL, try to extract relative path if it contains /Uploads/
      const uploadsIndex = profilePicture.indexOf('/Uploads/');
      if (uploadsIndex !== -1) {
        profilePicture = profilePicture.substring(uploadsIndex);
      } else {
        return profilePicture;
      }
    }
    if (profilePicture.startsWith('/Uploads/')) {
      return `${this.backendBaseUrl}${profilePicture}`;
    }
    // If the path is not a URL or /Uploads/, fallback
    return 'assets/profile-placeholder.png';
  }

  handleImageError(event: Event): void {
    if (!this.hasImageError) {
      this.hasImageError = true; // Prevent further error handling
      const imgElement = event.target as HTMLImageElement;
      console.warn('Image load error, falling back to placeholder:', imgElement.src);
      imgElement.src = 'assets/profile-placeholder.png';
    }
  }

  getProfileTitle(): string {
    switch (this.user?.role) {
      case 'WASHER':
        return 'PROFESSIONAL PROFILE';
      case 'CUSTOMER':
        return 'CUSTOMER PROFILE';
      case 'ADMIN':
        return 'ADMIN PROFILE';
      default:
        return 'USER PROFILE';
    }
  }

  getReviewsTitle(): string {
    switch (this.user?.role) {
      case 'WASHER':
        return 'Ratings & Reviews Received';
      case 'CUSTOMER':
        return 'Reviews Received from Washers';
      case 'ADMIN':
        return 'Admin Reviews';
      default:
        return 'Reviews';
    }
  }

  getReviewsGivenTitle(): string {
    switch (this.user?.role) {
      case 'WASHER':
        return 'Reviews Given to Customers';
      case 'CUSTOMER':
        return 'Reviews Given to Washers';
      case 'ADMIN':
        return 'Reviews Given';
      default:
        return 'Reviews Given';
    }
  }
}
