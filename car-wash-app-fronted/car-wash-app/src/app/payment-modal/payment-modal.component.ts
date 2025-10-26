// import { Component, Inject, AfterViewInit } from '@angular/core';
// import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
// import { HttpClient } from '@angular/common/http';
// import { MatButtonModule } from '@angular/material/button';
// import { MatDialogModule } from '@angular/material/dialog';
// import { CommonModule } from '@angular/common';
// import dropin from 'braintree-web-drop-in';

// @Component({
//   selector: 'app-payment-modal',
//   standalone: true,
//   imports: [CommonModule, MatDialogModule, MatButtonModule],
//   templateUrl: './payment-modal.component.html',
//   styleUrls: ['./payment-modal.component.scss']
// })
// export class PaymentModalComponent implements AfterViewInit {
//   clientToken: string | null = null;
//   instance: any;
//   loading = false;
//   errorMessage = '';

//   constructor(
//     public dialogRef: MatDialogRef<PaymentModalComponent>,
//     @Inject(MAT_DIALOG_DATA) public data: any,
//     private http: HttpClient
//   ) {
//     this.fetchClientToken();
//   }

//   ngAfterViewInit() {
//     if (this.clientToken) {
//       this.initializeBraintree();
//     }
//   }

//   fetchClientToken() {
//     this.http.get<{ clientToken: string }>('/api/payment/token').subscribe(
//       (response) => {
//         this.clientToken = response.clientToken;
//         this.initializeBraintree();
//       },
//       (error) => {
//         this.errorMessage = 'Failed to load payment gateway: ' + error.message;
//       }
//     );
//   }

//   initializeBraintree() {
//     const options: any = {
//       authorization: this.clientToken,
//       container: '#dropin-container',
//     };
//     dropin.create(options, (error: object | null, instance: any) => {
//       if (error) {
//         this.errorMessage = 'Payment initialization failed: ' + error;
//         return;
//       }
//       this.instance = instance;
//     });
//   }

//   makePayment() {
//     if (!this.instance) {
//       this.errorMessage = 'Payment system not ready.';
//       return;
//     }

//     this.loading = true;
//     this.instance.requestPaymentMethod((error: object | null, payload: { nonce: string } | undefined) => {
//       if (error) {
//         this.errorMessage = 'Payment error: ' + error;
//         this.loading = false;
//         return;
//       }
//       if (payload) {
//         this.http.post('/api/payment/checkout', { paymentMethodNonce: payload.nonce, amount: this.data.amount }).subscribe(
//           (response: any) => {
//             if (response.status === 'success') {
//               this.dialogRef.close({ success: true, transactionId: response.transaction.id });
//             } else {
//               this.errorMessage = 'Payment failed: ' + response.error;
//               this.loading = false;
//             }
//           },
//           (error) => {
//             this.errorMessage = 'Payment processing failed: ' + error.message;
//             this.loading = false;
//           }
//         );
//       }
//     });
//   }

//   onCancel() {
//     this.dialogRef.close({ success: false });
//   }
// }

//14-08-2025

// import { Component, Inject, AfterViewInit } from '@angular/core';
// import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
// import { PaymentService } from '../services/payment.service';
// import { AuthService } from '../services/auth.service';
// import { MatButtonModule } from '@angular/material/button';
// import { MatDialogModule } from '@angular/material/dialog';
// import { CommonModule } from '@angular/common';
// import dropin from 'braintree-web-drop-in';

// @Component({
//   selector: 'app-payment-modal',
//   standalone: true,
//   imports: [CommonModule, MatDialogModule, MatButtonModule],
//   templateUrl: './payment-modal.component.html',
//   styleUrls: ['./payment-modal.component.scss']
// })
// export class PaymentModalComponent implements AfterViewInit {
//   clientToken: string | null = null;
//   instance: any;
//   loading = false;
//   errorMessage = '';

//   constructor(
//     public dialogRef: MatDialogRef<PaymentModalComponent>,
//     @Inject(MAT_DIALOG_DATA) public data: {
//       washPackage: string;
//       amount: number;
//       carId: string;
//       location: string;
//       scheduledTime: string;
//       bookingId: string;
//       userEmail: string;
//     },
//     private paymentService: PaymentService,
//     private authService: AuthService
//   ) {
//     console.log('✅ Payment Modal Data:', this.data);
//     this.fetchClientToken();
//   }

//   ngAfterViewInit() {
//     if (this.clientToken) {
//       this.initializeBraintree();
//     }
//   }

//   fetchClientToken() {
//     this.paymentService.getClientToken().subscribe({
//       next: (response) => {
//         this.clientToken = response.clientToken;
//         console.log('✅ Client Token:', this.clientToken);
//         this.initializeBraintree();
//       },
//       error: (error) => {
//         this.errorMessage = 'Failed to load payment gateway: ' + error.message;
//         console.error('❌ Client Token Error:', error);
//       }
//     });
//   }

//   initializeBraintree() {
//     const options: any = {
//       authorization: this.clientToken,
//       container: '#dropin-container',
//     };
//     dropin.create(options, (error: object | null, instance: any) => {
//       if (error) {
//         this.errorMessage = 'Payment initialization failed: ' + error;
//         console.error('❌ Braintree Initialization Error:', error);
//         return;
//       }
//       this.instance = instance;
//       console.log('✅ Braintree Initialized');
//     });
//   }

//   makePayment() {
//     if (!this.instance) {
//       this.errorMessage = 'Payment system not ready.';
//       console.error('❌ Payment instance not initialized');
//       return;
//     }

//     this.loading = true;
//     this.instance.requestPaymentMethod((error: object | null, payload: { nonce: string } | undefined) => {
//       if (error) {
//         this.errorMessage = 'Payment error: ' + error;
//         console.error('❌ Payment Method Error:', error);
//         this.loading = false;
//         return;
//       }
//       if (payload) {
//         this.paymentService.processPayment({ paymentMethodNonce: payload.nonce, amount: this.data.amount }).subscribe({
//           next: (response: any) => {
//             if (response.status === 'success') {
//               const userId = this.authService.getUserId();
//               if (!userId || !this.data.bookingId || !this.data.userEmail) {
//                 this.errorMessage = 'Missing required data for notification (userId, bookingId, or userEmail)';
//                 console.error('❌ Missing Notification Data:', { userId, bookingId: this.data.bookingId, userEmail: this.data.userEmail });
//                 this.dialogRef.close({ success: true, transactionId: response.transaction.id });
//                 return;
//               }

//               const notificationRequest = {
//                 recipient: userId,
//                 userEmail: this.data.userEmail,
//                 bookingId: this.data.bookingId,
//                 serviceName: this.data.washPackage,
//                 bookingDate: new Date(this.data.scheduledTime).toISOString().split('T')[0],
//                 bookingTime: new Date(this.data.scheduledTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
//                 amount: this.data.amount
//               };

//               console.log('✅ Sending Notification Request:', notificationRequest);

//               this.paymentService.sendBookingNotification(notificationRequest).subscribe({
//                 next: () => {
//                   console.log('✅ Booking notification sent successfully');
//                   this.dialogRef.close({ success: true, transactionId: response.transaction.id });
//                 },
//                 error: (error) => {
//                   this.errorMessage = 'Payment successful, but notification failed: ' + error.message;
//                   console.error('❌ Notification Error:', error);
//                   this.dialogRef.close({ success: true, transactionId: response.transaction.id });
//                 }
//               });
//             } else {
//               this.errorMessage = 'Payment failed: ' + response.error;
//               console.error('❌ Payment Response Error:', response.error);
//               this.loading = false;
//             }
//           },
//           error: (error) => {
//             this.errorMessage = 'Payment processing failed: ' + error.message;
//             console.error('❌ Payment Processing Error:', error);
//             this.loading = false;
//           }
//         });
//       }
//     });
//   }

//   onCancel() {
//     this.dialogRef.close({ success: false });
//   }
// }

import { Component, Inject, AfterViewInit } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { PaymentService } from '../services/payment.service';
import { AuthService } from '../services/auth.service';
import { MatButtonModule } from '@angular/material/button';
import { MatDialogModule } from '@angular/material/dialog';
import { CommonModule } from '@angular/common';
import dropin from 'braintree-web-drop-in';

@Component({
  selector: 'app-payment-modal',
  standalone: true,
  imports: [CommonModule, MatDialogModule, MatButtonModule],
  templateUrl: './payment-modal.component.html',
  styleUrls: ['./payment-modal.component.scss'],
})
export class PaymentModalComponent implements AfterViewInit {
  clientToken: string | null = null;
  instance: any;
  loading = false;
  errorMessage = '';

  constructor(
    public dialogRef: MatDialogRef<PaymentModalComponent>,
    @Inject(MAT_DIALOG_DATA) public data: {
      washPackage: string;
      amount: number;
      carId: string;
      location: string;
      scheduledTime: string;
      bookingId: string;
      userEmail: string;
    },
    private paymentService: PaymentService,
    private authService: AuthService
  ) {
    console.log('✅ Payment Modal Data:', this.data);
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

  this.loading = true;
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
        amount: this.data.amount.toString(), // Convert number to string
        bookingId: this.data.bookingId,
      };
      console.log('✅ Sending Payment Request:', paymentData, 'with token:', this.authService.getToken());
      this.paymentService.processPayment(paymentData).subscribe({
        next: (response: any) => {
          if (response.status === 'success') {
            const userId = this.authService.getUserId();
            if (!userId || !this.data.bookingId || !this.data.userEmail) {
              this.errorMessage = 'Missing required data for notification (userId, bookingId, or userEmail)';
              console.error('❌ Missing Notification Data:', {
                userId,
                bookingId: this.data.bookingId,
                userEmail: this.data.userEmail,
              });
              this.dialogRef.close({ success: true, transactionId: response.transactionId });
              return;
            }

            const notificationRequest = {
              recipient: userId,
              userEmail: this.data.userEmail,
              bookingId: this.data.bookingId,
              serviceName: this.data.washPackage,
              bookingDate: new Date(this.data.scheduledTime).toISOString().split('T')[0],
              bookingTime: new Date(this.data.scheduledTime).toLocaleTimeString([], {
                hour: '2-digit',
                minute: '2-digit',
              }),
              amount: this.data.amount,
            };

            console.log('✅ Sending Notification Request:', notificationRequest);
            this.paymentService.sendBookingNotification(notificationRequest).subscribe({
              next: () => {
                console.log('✅ Booking notification sent successfully');
                this.dialogRef.close({ success: true, transactionId: response.transactionId });
              },
              error: (error) => {
                this.errorMessage = 'Payment successful, but notification failed: ' + error.message;
                console.error('❌ Notification Error:', error);
                this.dialogRef.close({ success: true, transactionId: response.transactionId });
              },
            });
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

  onCancel() {
    this.dialogRef.close({ success: false });
  }
}