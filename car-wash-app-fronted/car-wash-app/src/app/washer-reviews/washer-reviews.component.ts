import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { ReviewService } from '../services/review.service';
import { BookingService } from '../services/booking.service';
import { AuthService } from '../services/auth.service';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatSpinner } from '@angular/material/progress-spinner';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-washer-reviews',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatSpinner,
    MatIconModule,
  ],
  templateUrl: './washer-reviews.component.html',
  styleUrls: ['./washer-reviews.component.scss'],
})
export class WasherReviewsComponent implements OnInit {
  reviewForm: FormGroup;
  bookingId: string = '';
  customerId: string = '';
  washerId: string = '';
  booking: any = null;
  loading = true;
  errorMessage = '';
  successMessage = '';

  constructor(
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private reviewService: ReviewService,
    private bookingService: BookingService,
    private authService: AuthService
  ) {
    this.reviewForm = this.fb.group({
      rating: ['', Validators.required], // Removed min/max; handled by star clicks
      comment: [''],
    });
  }

  ngOnInit() {
    this.bookingId = this.route.snapshot.paramMap.get('bookingId') || '';
    this.customerId = this.route.snapshot.paramMap.get('customerId') || '';
    this.washerId = this.authService.getUserId() || '';

    if (!this.washerId) {
      this.errorMessage = 'Please log in as a washer to submit a review.';
      setTimeout(() => this.router.navigate(['/login']), 2000);
      return;
    }

    if (!this.bookingId || !this.customerId) {
      this.errorMessage = 'Invalid review request.';
      this.loading = false;
      return;
    }

    this.fetchBookingDetails();
  }

  fetchBookingDetails() {
    this.loading = true;
    this.bookingService.getBookingById(this.bookingId).subscribe({
      next: (booking) => {
        this.booking = booking;
        if (booking.status !== 'COMPLETED') {
          this.errorMessage = 'Only completed bookings can be reviewed.';
          setTimeout(() => this.router.navigate(['/washer-dashboard']), 2000);
        }
        this.loading = false;
      },
      error: (err) => {
        this.errorMessage = 'Failed to load booking: ' + err.message;
        this.loading = false;
      },
    });
  }

  setRating(rating: number) {
    this.reviewForm.patchValue({ rating });
    this.reviewForm.markAsTouched();
  }

  onSubmit() {
    if (this.reviewForm.valid) {
      const { rating, comment } = this.reviewForm.value;
      this.loading = true;
      this.errorMessage = '';
      this.successMessage = '';
      this.reviewService.addWasherReview(this.bookingId, this.washerId, this.customerId, rating, comment).subscribe({
        next: () => {
          this.successMessage = 'Review submitted successfully!';
          this.loading = false;
          setTimeout(() => this.router.navigate(['/washer-dashboard']), 2000);
        },
        error: (err) => {
          this.errorMessage = 'Failed to submit review: ' + err.message;
          this.loading = false;
        },
      });
    } else {
      this.errorMessage = 'Please provide a rating.';
    }
  }
}