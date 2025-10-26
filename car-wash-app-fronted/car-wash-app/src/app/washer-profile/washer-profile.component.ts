import { Component, OnInit } from '@angular/core';
import { AuthService } from '../services/auth.service';
import { ReviewService } from '../services/review.service';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';

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
  washerId: string;
  bookingId: string;
  rating: number;
  comment?: string;
}

@Component({
  selector: 'app-washer-profile',
  standalone: true,
  imports: [CommonModule, MatButtonModule, MatIconModule],
  templateUrl: './washer-profile.component.html',
  styleUrls: ['./washer-profile.component.scss'],
})
export class WasherProfileComponent implements OnInit {
  washer: User = { id: '', fullName: '', email: '', role: '' };
  reviews: Review[] = [];
  averageRating: number = 0;

  constructor(
    private authService: AuthService,
    private reviewService: ReviewService,
    private router: Router
  ) {}

  ngOnInit() {
    const washerId = this.authService.getUserId();
    if (!washerId) {
      this.router.navigate(['/login']);
      return;
    }

    this.authService.getUserProfile().subscribe({
      next: (profile: User) => {
        this.washer = profile;
      },
      error: (err: Error) => {
        console.error('Failed to load profile:', err.message);
        this.router.navigate(['/login']);
      },
    });

    this.reviewService.getReviewsForWasher(washerId).subscribe({
      next: (reviews: Review[]) => {
        this.reviews = reviews;
        this.calculateAverageRating();
      },
      error: (err: Error) => console.error('Failed to load reviews:', err.message),
    });
  }

  calculateAverageRating(): void {
    if (this.reviews.length > 0) {
      const total = this.reviews.reduce((sum: number, r: Review) => sum + r.rating, 0);
      this.averageRating = total / this.reviews.length;
    } else {
      this.averageRating = 0;
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
}