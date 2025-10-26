
import { Component, OnInit, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { Router } from '@angular/router';
import { BookingService, Booking, BookingResponse } from '../../services/booking.service';
import { ReceiptService } from '../../services/receipt.service';
import { PaymentService } from '../../services/payment.service';
import dropin from 'braintree-web-drop-in';

interface Receipt {
  id: string;
  userId: string;
  washerId: string | null;
  carModel: string;
  packageName: string;
  addOns: string;
  totalAmount: number;
  paymentDate: string;
  transactionId: string;
  paymentStatus: string;
  afterWashPhotoUrl: string;
}

interface BookingData {
  carId: string;
  washPackage: string;
  notes?: string;
  scheduledTime: string;
  location: string;
  transactionId?: string;
  promoCode?: string;
}

@Component({
  selector: 'app-payment',
  standalone: true,
  imports: [CommonModule, MatButtonModule],
  templateUrl: './payment.component.html',
  styleUrls: ['./payment.component.scss'],
})
export class PaymentComponent implements OnInit, AfterViewInit {
  booking: BookingData | null = null;
  amount: number = 0;
  userId: string | null = null;
  clientToken: string | null = null;
  instance: any;
  loading = false;
  errorMessage = '';
  successMessage = '';
  paymentSuccess = false;
  showModal = true;

  constructor(
    private router: Router,
    private bookingService: BookingService,
    private receiptService: ReceiptService,
    private paymentService: PaymentService
  ) {
    const navigation = this.router.getCurrentNavigation();
    const state = navigation?.extras.state as { booking: BookingData; amount: number; userId: string } | undefined;
    if (state) {
      this.booking = state.booking;
      this.amount = Number(state.amount.toFixed(2)); // Ensure amount is formatted
      this.userId = state.userId;
    }
  }

  ngOnInit(): void {
    if (!this.userId || !this.booking) {
      this.errorMessage = 'Invalid booking details. Please try again.';
      console.error('❌ Invalid booking data:', { userId: this.userId, booking: this.booking });
      this.router.navigate(['/book-service']);
      return;
    }
    this.fetchClientToken();
  }

  ngAfterViewInit() {
    if (this.clientToken) {
      this.initializeBraintree();
    }
  }

  fetchClientToken() {
    this.paymentService.getClientToken().subscribe({
      next: (response) => {
        this.clientToken = response.clientToken;
        console.log('✅ Client Token:', this.clientToken);
        this.initializeBraintree();
      },
      error: (error) => {
        this.errorMessage = 'Failed to load payment gateway: ' + (error.message || 'Unknown error');
        console.error('❌ Client Token Error:', error);
      },
    });
  }

  initializeBraintree() {
    const options: any = {
      authorization: this.clientToken,
      container: '#dropin-container',
    };
    dropin.create(options, (error: object | null, instance: any) => {
      if (error) {
        this.errorMessage = 'Payment initialization failed: ' + JSON.stringify(error);
        console.error('❌ Braintree Initialization Error:', error);
        return;
      }
      this.instance = instance;
      console.log('✅ Braintree Initialized');
    });
  }

  makePayment() {
    if (!this.instance) {
      this.errorMessage = 'Payment system not ready.';
      console.error('❌ Payment instance not initialized');
      return;
    }
    if (this.amount <= 0) {
      this.errorMessage = 'Invalid payment amount.';
      console.error('❌ Invalid amount:', this.amount);
      return;
    }

    this.loading = true;
    this.errorMessage = '';
    this.successMessage = '';

    this.instance.requestPaymentMethod((error: object | null, payload: { nonce: string } | undefined) => {
      if (error) {
        this.errorMessage = 'Payment error: ' + JSON.stringify(error);
        console.error('❌ Payment Method Error:', error);
        this.loading = false;
        return;
      }
      if (payload) {
        const paymentData = {
          paymentMethodNonce: payload.nonce,
          amount: this.amount.toFixed(2), // Convert to string with 2 decimal places
          bookingId: this.booking?.transactionId || this.generateTempBookingId(),
        };
        console.log('✅ Sending Payment Request:', paymentData);
        this.paymentService.processPayment(paymentData).subscribe({
          next: (response: any) => {
            if (response.status === 'success') {
              if (this.booking) {
                this.booking.transactionId = response.transactionId;
              }
              this.submitBooking();
            } else {
              this.errorMessage = 'Payment failed: ' + (response.error || 'Unknown error');
              console.error('❌ Payment Response Error:', response.error);
              this.loading = false;
            }
          },
          error: (error) => {
            this.errorMessage = 'Payment processing failed: ' + (error.message || 'Server error');
            console.error('❌ Payment Processing Error:', error);
            this.loading = false;
          },
        });
      }
    });
  }

  submitBooking() {
    if (!this.userId || !this.booking) {
      this.errorMessage = 'Invalid booking data.';
      console.error('❌ Invalid booking data:', { userId: this.userId, booking: this.booking });
      this.loading = false;
      return;
    }

    const bookingData: Partial<Booking> = {
      userId: this.userId,
      carId: this.booking.carId,
      washPackage: this.booking.washPackage,
      notes: this.booking.notes || '',
      scheduledTime: new Date(this.booking.scheduledTime).toISOString(),
      status: 'PENDING',
      acknowledged: false,
      paymentStatus: 'PAID',
      location: this.booking.location,
      transactionId: this.booking.transactionId,
      totalAmount: this.amount,
      promoCode: this.booking.promoCode || '',
    };

    console.log('✅ Submitting Booking:', bookingData);
    this.bookingService.createBooking(bookingData).subscribe({
      next: (response: BookingResponse) => {
        console.log('✅ Booking Created:', response);
        const bookingId = response.booking.id || this.generateTempBookingId();
        this.saveReceipt(bookingId);
        this.successMessage = 'Payment successful! Booking confirmed.';
        this.paymentSuccess = true;
        setTimeout(() => this.router.navigate(['/my-orders']), 2000);
      },
      error: (error) => {
        this.errorMessage = 'Booking failed: ' + (error.message || 'Unknown error');
        console.error('❌ Booking Error:', error);
        this.loading = false;
      },
      complete: () => (this.loading = false),
    });
  }

  saveReceipt(bookingId: string) {
    if (!this.userId || !this.booking) {
      console.error('❌ Cannot save receipt: missing userId or booking');
      return;
    }

    const receipt: Receipt = {
      id: bookingId,
      userId: this.userId,
      washerId: null,
      carModel: this.booking.carId,
      packageName: this.booking.washPackage,
      addOns: this.booking.notes || 'None',
      totalAmount: this.amount,
      paymentDate: new Date().toISOString(),
      transactionId: this.booking.transactionId || '',
      paymentStatus: 'PAID',
      afterWashPhotoUrl: '',
    };

    console.log('✅ Saving Receipt:', receipt);
    this.receiptService.saveReceipt(receipt).subscribe({
      next: (savedReceipt: Receipt) => {
        console.log('✅ Receipt saved for booking:', bookingId, savedReceipt);
      },
      error: (error: Error) => {
        console.error('❌ Failed to save receipt:', error);
        this.errorMessage =
          'Payment succeeded, but receipt save failed: ' + (error.message || 'Bad Request');
      },
    });
  }

  cancel() {
    this.showModal = false;
    this.router.navigate(['/book-service']);
  }

  private generateTempBookingId(): string {
    return 'temp-' + Math.random().toString(36).substr(2, 9);
  }
}