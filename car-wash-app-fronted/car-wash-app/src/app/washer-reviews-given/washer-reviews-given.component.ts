import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { ReviewService, Review } from '../services/review.service';
import { AuthService } from '../services/auth.service';
import { CommonModule } from '@angular/common';
import { MatTableModule, MatTableDataSource } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatSpinner } from '@angular/material/progress-spinner';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-washer-reviews-given',
  standalone: true,
  imports: [
    CommonModule,
    MatTableModule,
    MatButtonModule,
    MatSpinner,
    MatIconModule,
  ],
  templateUrl: './washer-reviews-given.component.html',
  styleUrls: ['./washer-reviews-given.component.scss'],
})
export class WasherReviewsGivenComponent implements OnInit {
  displayedColumns: string[] = ['customerName', 'rating', 'comment', 'bookingId'];
  reviews = new MatTableDataSource<Review>();
  loading = true;
  errorMessage = '';
  washerId: string = '';

  constructor(
    private router: Router,
    private reviewService: ReviewService,
    private authService: AuthService
  ) {}

  ngOnInit() {
    this.washerId = this.authService.getUserId() || '';
    if (!this.washerId) {
      this.errorMessage = 'Please log in as a washer to view reviews.';
      setTimeout(() => this.router.navigate(['/login']), 2000);
      return;
    }
    this.loadReviews();
  }

  loadReviews() {
    this.loading = true;
    this.reviewService.getReviewsGivenByWasher(this.washerId).subscribe({
      next: (data: Review[]) => {
        this.reviews.data = data;
        this.loading = false;
      },
      error: (err) => {
        this.errorMessage = 'Failed to load reviews: ' + err.message;
        this.loading = false;
      },
    });
  }

  goBack() {
    this.router.navigate(['/washer-dashboard']);
  }
}