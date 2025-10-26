// import { Component, OnInit } from '@angular/core';
// import { CommonModule } from '@angular/common';
// import { ReceiptService, Receipt } from '../services/receipt.service';
// import { AuthService } from '../services/auth.service';
// import { NotificationService } from '../services/notification.service';
// import { NotificationComponent } from '../components/notification/notification.component';
// import { Router } from '@angular/router';
// import jsPDF from 'jspdf';
// import autoTable from 'jspdf-autotable';

// @Component({
//   selector: 'app-receipt',
//   templateUrl: './receipt.component.html',
//   styleUrls: ['./receipt.component.scss'],
//   standalone: true,
//   imports: [CommonModule, NotificationComponent], // Add NotificationComponent
// })
// export class ReceiptComponent implements OnInit {
//   receipts: Receipt[] = [];
//   bookingId: string | null = null;
//   errorMessage: string = '';
//   loading: boolean = false;

//   constructor(
//     private receiptService: ReceiptService,
//     private authService: AuthService,
//     private notificationService: NotificationService,
//     private router: Router
//   ) {
//     this.bookingId = (history.state as { bookingId?: string })?.bookingId || null;
//   }

//   ngOnInit(): void {
//     this.loadReceipts();
//   }

//   loadReceipts() {
//     const userId = this.authService.getUserId();
//     if (!userId) {
//       this.errorMessage = 'User not logged in';
//       this.notificationService.pushNotification({
//         id: `notif-${Date.now()}`,
//         recipient: 'unknown',
//         message: this.errorMessage,
//         timestamp: new Date().toISOString(),
//         isRead: false
//       });
//       this.router.navigate(['/login']);
//       return;
//     }

//     if (!this.bookingId) {
//       this.errorMessage = 'No booking ID provided';
//       this.notificationService.pushNotification({
//         id: `notif-${Date.now()}`,
//         recipient: userId,
//         message: this.errorMessage,
//         timestamp: new Date().toISOString(),
//         isRead: false
//       });
//       this.receipts = [];
//       this.router.navigate(['/booking-history']);
//       return;
//     }

//     this.loading = true;
//     console.log('Fetching receipt for bookingId:', this.bookingId);
//     this.receiptService.getReceiptByBookingId(this.bookingId).subscribe({
//       next: (receipt) => {
//         this.receipts = receipt ? [receipt] : [];
//         if (!receipt) {
//           this.errorMessage = `No receipt found for booking ID: ${this.bookingId}`;
//           this.notificationService.pushNotification({
//             id: `notif-${Date.now()}`,
//             recipient: userId,
//             message: this.errorMessage,
//             timestamp: new Date().toISOString(),
//             isRead: false
//           });
//         }
//         this.loading = false;
//       },
//       error: (error) => {
//         this.errorMessage = 'Failed to fetch receipt: ' + error.message;
//         this.notificationService.pushNotification({
//           id: `notif-${Date.now()}`,
//           recipient: userId,
//           message: this.errorMessage,
//           timestamp: new Date().toISOString(),
//           isRead: false
//         });
//         this.receipts = [];
//         this.loading = false;
//         console.error('Error fetching receipt:', error);
//       }
//     });
//   }

//   downloadReceipt(receipt: Receipt) {
//     if (!receipt) return;

//     const doc = new jsPDF();
//     doc.text('Payment Receipt', 90, 10);

//     autoTable(doc, {
//       startY: 20,
//       head: [['Field', 'Details']],
//       body: [
//         ['Car Model', receipt.carModel || 'N/A'],
//         ['Package', receipt.packageName || 'N/A'],
//         ['Add-ons', receipt.addOns || 'None'],
//         ['Total Amount', `$${receipt.totalAmount || 0}`],
//         ['Payment Date', receipt.paymentDate ? new Date(receipt.paymentDate).toLocaleString() : 'N/A'],
//         ['Transaction ID', receipt.transactionId || receipt.id || 'N/A'],
//         ['Payment Status', receipt.paymentStatus || 'N/A'],
//         ['After Wash Photo', receipt.afterWashPhotoUrl || 'Not provided']
//       ]
//     });

//     doc.save(`Receipt_${receipt.transactionId || receipt.id || 'unknown'}.pdf`);
//   }

//   shareReceipt(receipt: Receipt) {
//     if (!receipt) return;

//     const shareData = {
//       title: 'Car Wash Receipt',
//       text: `Package: ${receipt.packageName || 'N/A'}\nTotal: $${receipt.totalAmount || 0}\nPhoto: ${receipt.afterWashPhotoUrl || 'Not available'}`,
//       url: receipt.afterWashPhotoUrl || '',
//     };

//     if (navigator.share) {
//       navigator.share(shareData).catch(error => console.error('Error sharing receipt:', error));
//     } else {
//       alert('Sharing not supported in this browser.');
//     }
//   }
// }

import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReceiptService, Receipt } from '../services/receipt.service';
import { AuthService } from '../services/auth.service';
import { NotificationService } from '../services/notification.service';
import { NotificationComponent } from '../components/notification/notification.component';
import { Router } from '@angular/router';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

@Component({
  selector: 'app-receipt',
  templateUrl: './receipt.component.html',
  styleUrls: ['./receipt.component.scss'],
  standalone: true,
  imports: [CommonModule, NotificationComponent],
})
export class ReceiptComponent implements OnInit {
  receipts: Receipt[] = [];
  bookingId: string | null = null;
  errorMessage: string = '';
  loading: boolean = false;

  constructor(
    private receiptService: ReceiptService,
    private authService: AuthService,
    private notificationService: NotificationService,
    private router: Router
  ) {
    this.bookingId = (history.state as { bookingId?: string })?.bookingId || null;
  }

  ngOnInit(): void {
    this.loadReceipts();
  }

  loadReceipts() {
    const userId = this.authService.getUserId();
    if (!userId) {
      this.errorMessage = 'User not logged in';
      this.notificationService.pushNotification({
        id: `notif-${Date.now()}`,
        recipient: 'unknown',
        message: this.errorMessage,
        timestamp: new Date().toISOString(),
        isRead: false
      });
      this.router.navigate(['/login']);
      return;
    }

    if (!this.bookingId) {
      this.errorMessage = 'No booking ID provided';
      this.notificationService.pushNotification({
        id: `notif-${Date.now()}`,
        recipient: userId,
        message: this.errorMessage,
        timestamp: new Date().toISOString(),
        isRead: false
      });
      this.receipts = [];
      this.router.navigate(['/booking-history']);
      return;
    }

    this.loading = true;
    console.log('Fetching receipt for bookingId:', this.bookingId);
    this.receiptService.getReceiptByBookingId(this.bookingId).subscribe({
      next: (receipt) => {
        this.receipts = receipt ? [receipt] : [];
        if (!receipt) {
          this.errorMessage = `No receipt found for booking ID: ${this.bookingId}`;
          this.notificationService.pushNotification({
            id: `notif-${Date.now()}`,
            recipient: userId,
            message: this.errorMessage,
            timestamp: new Date().toISOString(),
            isRead: false
          });
        }
        this.loading = false;
      },
      error: (error) => {
        this.errorMessage = 'Failed to fetch receipt: ' + error.message;
        this.notificationService.pushNotification({
          id: `notif-${Date.now()}`,
          recipient: userId,
          message: this.errorMessage,
          timestamp: new Date().toISOString(),
          isRead: false
        });
        this.receipts = [];
        this.loading = false;
        console.error('Error fetching receipt:', error);
      }
    });
  }

  downloadReceipt(receipt: Receipt) {
    if (!receipt) return;

    const doc = new jsPDF();
    doc.text('Payment Receipt', 90, 10);

    autoTable(doc, {
      startY: 20,
      head: [['Field', 'Details']],
      body: [
        ['Car Model', receipt.carModel || 'N/A'],
        ['Package', receipt.packageName || 'N/A'],
        ['Add-ons', receipt.addOns || 'None'],
        ['Total Amount', `$${receipt.totalAmount || 0}`],
        ['Payment Date', receipt.paymentDate ? new Date(receipt.paymentDate).toLocaleString() : 'N/A'],
        ['Transaction ID', receipt.transactionId || receipt.id || 'N/A'],
        ['Payment Status', receipt.paymentStatus || 'N/A'],
        ['After Wash Photo', receipt.afterWashPhotoUrl || 'Not provided']
      ]
    });

    doc.save(`Receipt_${receipt.transactionId || receipt.id || 'unknown'}.pdf`);
  }

  shareReceipt(receipt: Receipt) {
    if (!receipt) return;

    const shareData = {
      title: 'Car Wash Receipt',
      text: `Package: ${receipt.packageName || 'N/A'}\nTotal: $${receipt.totalAmount || 0}\nPhoto: ${receipt.afterWashPhotoUrl || 'Not available'}`,
      url: receipt.afterWashPhotoUrl || '',
    };

    if (navigator.share) {
      navigator.share(shareData).catch(error => console.error('Error sharing receipt:', error));
    } else {
      alert('Sharing not supported in this browser.');
    }
  }
}