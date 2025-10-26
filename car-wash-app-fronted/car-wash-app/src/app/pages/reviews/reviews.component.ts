// import { Component, OnInit } from '@angular/core';
// import { FormBuilder, FormGroup, Validators } from '@angular/forms';
// import { ActivatedRoute, Router } from '@angular/router';
// import { ReviewService } from '../../services/review.service';
// import { UserService } from '../../services/user.service';
// import { BookingService } from '../../services/booking.service';
// import { CommonModule } from '@angular/common';
// import { ReactiveFormsModule } from '@angular/forms';
// import { MatFormFieldModule } from '@angular/material/form-field';
// import { MatInputModule } from '@angular/material/input';
// import { MatButtonModule } from '@angular/material/button';
// import { MatProgressSpinnerModule } from '@angular/material/progress-spinner'; // Import MatSpinnerModule
// import { MatIconModule } from '@angular/material/icon'; // Import MatIconModule
// import { MatDividerModule } from '@angular/material/divider'; // Import MatDividerModule

// interface Booking {
//   id: string;
//   userId: string;
//   carId: string;
//   washPackage: string;
//   scheduledTime: string;
//   status: string;
//   location: string;
//   notes: string;
//   washerId: string;
//   acknowledged: boolean;
//   paymentStatus: string;
//   reviewId?: string;
// }

// interface Review {
//   id: string;
//   customerId: string;
//   washerId: string;
//   bookingId: string;
//   rating: number;
//   comment?: string;
// }

// @Component({
//   selector: 'app-reviews',
//   standalone: true,
//   imports: [
//     CommonModule,
//     ReactiveFormsModule,
//     MatFormFieldModule,
//     MatInputModule,
//     MatButtonModule,
//     MatProgressSpinnerModule, // Add MatSpinnerModule to imports
//     MatIconModule, // Add MatIconModule to imports
//     MatDividerModule // Add MatDividerModule to imports
//   ],
//   templateUrl: './reviews.component.html',
//   styleUrls: ['./reviews.component.scss']
// })
// export class ReviewsComponent implements OnInit {
//   reviewForm: FormGroup;
//   bookingId: string = '';
//   washerId: string = '';
//   customerId: string = '';
//   booking: Booking | null = null;
//   loading: boolean = true;
//   errorMessage: string = '';
//   successMessage: string = '';

//   constructor(
//     private fb: FormBuilder,
//     private route: ActivatedRoute,
//     private router: Router,
//     private reviewService: ReviewService,
//     private userService: UserService,
//     private bookingService: BookingService
//   ) {
//     this.reviewForm = this.fb.group({
//       rating: ['', [Validators.required, Validators.min(1), Validators.max(5)]],
//       comment: ['']
//     });
//   }

//   ngOnInit() {
//     this.bookingId = this.route.snapshot.paramMap.get('bookingId') || '';
//     this.washerId = this.route.snapshot.paramMap.get('washerId') || '';
//     this.customerId = this.userService.getCurrentUserId();

//     if (!this.customerId) {
//       this.errorMessage = 'Please log in to submit a review.';
//       setTimeout(() => this.router.navigate(['/login']), 2000);
//       return;
//     }

//     if (!this.bookingId || !this.washerId) {
//       this.errorMessage = 'Invalid review request.';
//       this.loading = false;
//       return;
//     }

//     this.fetchBookingDetails();
//   }

//   fetchBookingDetails() {
//     this.loading = true;
//     this.bookingService.getBookingById(this.bookingId).subscribe({
//       next: (booking: Booking) => {
//         this.booking = booking;
//         if (booking.status !== 'COMPLETED') {
//           this.errorMessage = 'Only completed bookings can be reviewed.';
//           setTimeout(() => this.router.navigate(['/booking-history']), 2000);
//         }
//         this.loading = false;
//       },
//       error: (err: Error) => {
//         this.errorMessage = 'Failed to load booking: ' + err.message;
//         this.loading = false;
//       }
//     });
//   }

//   onSubmit() {
//     if (this.reviewForm.valid) {
//       const { rating, comment } = this.reviewForm.value;
//       this.reviewService.addReview(this.bookingId, this.customerId, this.washerId, rating, comment).subscribe({
//         next: () => { // Removed unused 'response' parameter
//           this.successMessage = 'Review submitted successfully!';
//           setTimeout(() => {
//             this.router.navigate(['/booking-history']);
//             // Optionally navigate to receipt
//             // this.viewReceipt();
//           }, 2000);
//         },
//         error: (err: Error) => {
//           this.errorMessage = 'Failed to submit review: ' + err.message;
//         }
//       });
//     } else {
//       this.errorMessage = 'Please provide a valid rating (1-5).';
//     }
//   }

//   viewReceipt() {
//     this.router.navigate(['/receipt'], { state: { bookingId: this.bookingId } });
//   }
// }
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { ReviewService } from '../../services/review.service';
import { UserService } from '../../services/user.service';
import { BookingService, Booking } from '../../services/booking.service';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatIconModule } from '@angular/material/icon';
import { MatDividerModule } from '@angular/material/divider';
import { MatCardModule } from '@angular/material/card';

interface Review {
  id: string;
  customerId: string;
  washerId: string;
  bookingId: string;
  rating: number;
  comment?: string;
}

@Component({
  selector: 'app-reviews',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatProgressSpinnerModule,
    MatIconModule,
    MatDividerModule,
    MatCardModule,
  ],
  templateUrl: './reviews.component.html',
  styleUrls: ['./reviews.component.scss'],
})
export class ReviewsComponent implements OnInit {
  reviewForm: FormGroup;
  bookingId: string = '';
  washerId: string = '';
  customerId: string = '';
  booking: Booking | null = null;
  loading: boolean = true;
  errorMessage: string = '';
  successMessage: string = '';

  constructor(
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private reviewService: ReviewService,
    private userService: UserService,
    private bookingService: BookingService
  ) {
    this.reviewForm = this.fb.group({
      rating: ['', [Validators.required, Validators.min(1), Validators.max(5)]],
      comment: [''],
    });
  }

  ngOnInit() {
    this.bookingId = this.route.snapshot.paramMap.get('bookingId') || '';
    this.washerId = this.route.snapshot.paramMap.get('washerId') || '';
    this.customerId = this.userService.getCurrentUserId();

    if (!this.customerId) {
      this.errorMessage = 'Please log in to submit a review.';
      setTimeout(() => this.router.navigate(['/login']), 2000);
      return;
    }

    if (!this.bookingId || !this.washerId) {
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
          setTimeout(() => this.router.navigate(['/booking-history']), 2000);
        }
        this.loading = false;
      },
      error: (err) => {
        this.errorMessage = 'Failed to load booking: ' + err.message;
        this.loading = false;
      },
    });
  }

  onSubmit() {
    if (this.reviewForm.valid) {
      const { rating, comment } = this.reviewForm.value;
      this.reviewService.addReview(this.bookingId, this.customerId, this.washerId, rating, comment).subscribe({
        next: () => {
          this.successMessage = 'Review submitted successfully!';
          setTimeout(() => {
            this.router.navigate(['/booking-history']);
          }, 2000);
        },
        error: (err) => {
          this.errorMessage = 'Failed to submit review: ' + err.message;
        },
      });
    } else {
      this.errorMessage = 'Please provide a valid rating (1-5).';
    }
  }

  viewReceipt() {
    this.router.navigate(['/receipt'], { state: { bookingId: this.bookingId } });
  }
}