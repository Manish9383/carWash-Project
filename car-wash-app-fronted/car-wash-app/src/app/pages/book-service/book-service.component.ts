
import { MatCardModule } from '@angular/material/card';


// import { Component, OnInit } from '@angular/core';
// import { FormsModule } from '@angular/forms';
// import { CommonModule } from '@angular/common';
// import { MatFormFieldModule } from '@angular/material/form-field';
// import { MatInputModule } from '@angular/material/input';
// import { MatSelectModule } from '@angular/material/select';
// import { MatButtonModule } from '@angular/material/button';
// import { MatIconModule } from '@angular/material/icon';
// import { BookingService } from '../../services/booking.service';
// import { AuthService } from '../../services/auth.service';
// import { HttpClient } from '@angular/common/http';
// import { Router } from '@angular/router';

// @Component({
//   selector: 'app-book-service',
//   standalone: true,
//   imports: [CommonModule, FormsModule, MatFormFieldModule, MatInputModule, MatSelectModule, MatButtonModule, MatIconModule],
//   templateUrl: './book-service.component.html',
//   styleUrls: ['./book-service.component.scss']
// })
// export class BookServiceComponent implements OnInit {
//   booking = { carId: '', washPackage: 'basic', notes: '', scheduledTime: '', location: '', paymentStatus: 'PENDING', transactionId: '', promoCode: '' };
//   bookings: any[] = [];
//   washers: any[] = [];
//   loading = false;
//   amount: number = 200; // Default to Basic
//   discountedAmount: number | null = null;
//   promoCode: string = '';
//   userId: string | null = null;
//   minDate: string = '';
//   errorMessage = '';
//   successMessage = '';

//   constructor(
//     private bookingService: BookingService,
//     private authService: AuthService,
//     private http: HttpClient,
//     private router: Router
//   ) {}

//   ngOnInit(): void {
//     this.userId = this.authService.getUserId();
//     if (this.userId) {
//       this.fetchUserBookings();
//       this.fetchAvailableWashers();
//       this.minDate = this.formatDateForInput(new Date());
//     }
//   }

//   updateAmount() {
//     this.amount = this.getPackageAmount(this.booking.washPackage);
//     this.discountedAmount = null; // Reset discounted amount when package changes
//     this.promoCode = ''; // Reset promo code
//     this.booking.promoCode = ''; // Reset booking promo code
//     this.successMessage = '';
//     this.errorMessage = '';
//   }

//   getPackageAmount(packageName: string): number {
//     switch (packageName) {
//       case 'basic': return 200;
//       case 'premium': return 300;
//       case 'deluxe': return 400;
//       default: return 200;
//     }
//   }

//   applyPromoCode() {
//     if (!this.promoCode) {
//       this.errorMessage = 'Please enter a promo code.';
//       return;
//     }
//     this.loading = true;
//     this.errorMessage = '';
//     this.successMessage = '';

//     this.bookingService.applyPromoCode(this.promoCode, this.amount).subscribe({
//       next: (response) => {
//         this.discountedAmount = response.discountedAmount;
//         this.booking.promoCode = response.promoCode;
//         this.successMessage = `Promo code ${response.promoCode} applied successfully!`;
//         this.loading = false;
//       },
//       error: (err) => {
//         this.errorMessage = err.message || 'Invalid promo code.';
//         this.discountedAmount = null;
//         this.booking.promoCode = '';
//         this.loading = false;
//       }
//     });
//   }

//   initPayment() {
//     if (!this.userId) {
//       this.errorMessage = 'Please log in to book a service.';
//       return;
//     }
//     if (!this.booking.carId || !this.booking.scheduledTime || !this.booking.location) {
//       this.errorMessage = 'Please provide all required fields.';
//       return;
//     }

//     this.loading = true;
//     this.router.navigate(['/payment'], {
//       state: {
//         booking: { ...this.booking },
//         amount: this.discountedAmount !== null ? this.discountedAmount : this.amount,
//         userId: this.userId
//       }
//     });
//   }

//   fetchUserBookings() {
//     if (this.userId) {
//       this.bookingService.getBookingHistory(this.userId).subscribe({
//         next: (response) => (this.bookings = response || []),
//         error: (error) => console.error('Error fetching bookings:', error),
//       });
//     }
//   }

//   fetchAvailableWashers() {
//     this.bookingService.getAvailableWashers().subscribe({
//       next: (washers) => {
//         this.washers = washers;
//         console.log('Available Washers:', this.washers);
//       },
//       error: (error) => console.error('Error fetching washers:', error),
//     });
//   }

//   openGoogleMaps(location: string) {
//     if (location) {
//       const url = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(location)}`;
//       window.open(url, '_blank');
//     } else {
//       alert('Please enter a location first.');
//     }
//   }

//   private formatDateForInput(date: Date): string {
//     const year = date.getFullYear();
//     const month = String(date.getMonth() + 1).padStart(2, '0');
//     const day = String(date.getDate()).padStart(2, '0');
//     const hours = String(date.getHours()).padStart(2, '0');
//     const minutes = String(date.getMinutes()).padStart(2, '0');
//     return `${year}-${month}-${day}T${hours}:${minutes}`;
//   }
// }

// src/app/book-service/book-service.component.ts
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { BookingService, Booking, ServicePlan, AddOn } from '../../services/booking.service'; // Import from BookingService
import { AuthService } from '../../services/auth.service';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';

@Component({
  selector: 'app-book-service',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatButtonModule,
    MatIconModule,
    MatCardModule,
  ],
  templateUrl: './book-service.component.html',
  styleUrls: ['./book-service.component.scss'],
})
export class BookServiceComponent implements OnInit {
  booking: Booking = {
    id: '',
    userId: '',
    carId: '',
    washPackage: '',
    addOnIds: [], // Initialize as empty array
    notes: '',
    scheduledTime: '',
    location: '',
    status: 'PENDING',
    paymentStatus: 'PENDING',
    transactionId: '',
    promoCode: '',
    acknowledged: false,
  };
  bookings: Booking[] = [];
  washers: any[] = []; // Replace 'any' with User interface from UserService if available
  servicePlans: ServicePlan[] = [];
  addOns: AddOn[] = [];
  loading = false;
  amount: number = 0;
  discountedAmount: number | null = null;
  promoCode: string = '';
  userId: string | null = null;
  minDate: string = '';
  errorMessage = '';
  successMessage = '';

  constructor(
    private bookingService: BookingService,
    private authService: AuthService,
    private http: HttpClient,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.userId = this.authService.getUserId();
    if (this.userId) {
      this.booking.userId = this.userId; // Set userId in booking
      this.fetchUserBookings();
      this.fetchAvailableWashers();
      this.fetchServicePlans();
      this.fetchAddOns();
      this.minDate = this.formatDateForInput(new Date());
    }
  }

  fetchServicePlans() {
    this.bookingService.getServicePlans().subscribe({
      next: (plans: ServicePlan[]) => {
        this.servicePlans = plans.filter((plan) => plan.active);
        if (this.servicePlans.length > 0 && !this.booking.washPackage) {
          this.booking.washPackage = this.servicePlans[0].name;
          this.updateAmount();
        }
      },
      error: (error: any) => console.error('Error fetching service plans:', error),
    });
  }

  fetchAddOns() {
    this.bookingService.getAddOns().subscribe({
      next: (addOns: AddOn[]) => {
        this.addOns = addOns.filter((addOn) => addOn.active);
      },
      error: (error: any) => console.error('Error fetching add-ons:', error),
    });
  }

  updateAmount() {
    this.amount = 0;
    const selectedPlan = this.servicePlans.find((plan) => plan.name === this.booking.washPackage);
    if (selectedPlan) {
      this.amount += selectedPlan.price;
    }
    if (this.booking.addOnIds && this.booking.addOnIds.length > 0) {
      this.addOns.forEach((addOn) => {
        if (this.booking.addOnIds!.includes(addOn.id)) {
          this.amount += addOn.price;
        }
      });
    }
    this.discountedAmount = null;
    this.promoCode = '';
    this.booking.promoCode = '';
    this.successMessage = '';
    this.errorMessage = '';
  }

  applyPromoCode() {
    if (!this.promoCode) {
      this.errorMessage = 'Please enter a promo code.';
      return;
    }
    this.loading = true;
    this.errorMessage = '';
    this.successMessage = '';

    this.bookingService.applyPromoCode(this.promoCode, this.amount).subscribe({
      next: (response: { discountedAmount: number; promoCode: string }) => {
        this.discountedAmount = response.discountedAmount;
        this.booking.promoCode = response.promoCode;
        this.successMessage = `Promo code ${response.promoCode} applied successfully!`;
        this.loading = false;
      },
      error: (err: any) => {
        this.errorMessage = err.message || 'Invalid promo code.';
        this.discountedAmount = null;
        this.booking.promoCode = '';
        this.loading = false;
      },
    });
  }

  initPayment() {
    if (!this.userId) {
      this.errorMessage = 'Please log in to book a service.';
      return;
    }
    if (!this.booking.carId || !this.booking.washPackage || !this.booking.scheduledTime || !this.booking.location) {
      this.errorMessage = 'Please provide all required fields.';
      return;
    }

    this.loading = true;
    this.router.navigate(['/payment'], {
      state: {
        booking: { ...this.booking },
        amount: this.discountedAmount !== null ? this.discountedAmount : this.amount,
        userId: this.userId,
      },
    });
  }

  fetchUserBookings() {
    if (this.userId) {
      this.bookingService.getBookingHistory(this.userId).subscribe({
        next: (response: Booking[]) => {
          this.bookings = response || [];
        },
        error: (error: any) => console.error('Error fetching bookings:', error),
      });
    }
  }

  fetchAvailableWashers() {
    this.bookingService.getAvailableWashers().subscribe({
      next: (washers: any[]) => {
        this.washers = washers;
        console.log('Available Washers:', this.washers);
      },
      error: (error: any) => console.error('Error fetching washers:', error),
    });
  }

  openGoogleMaps(location: string) {
    if (location) {
      const url = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(location)}`;
      window.open(url, '_blank');
    } else {
      alert('Please enter a location first.');
    }
  }

  private formatDateForInput(date: Date): string {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    return `${year}-${month}-${day}T${hours}:${minutes}`;
  }
}