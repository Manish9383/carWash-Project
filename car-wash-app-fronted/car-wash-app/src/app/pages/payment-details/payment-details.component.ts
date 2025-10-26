import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { HttpClientModule, HttpClient } from '@angular/common/http'; // ✅ Import HttpClientModule

@Component({
  selector: 'app-payment-details',
  standalone: true,
  imports: [FormsModule, HttpClientModule], // ✅ Ensure HttpClientModule is imported
  templateUrl: './payment-details.component.html',
  styleUrls: ['./payment-details.component.scss']
})
export class PaymentDetailsComponent {
  payment = { cardholder: '', cardNumber: '', expiry: '', cvv: '' };

  constructor(private http: HttpClient) {} // ✅ Inject HttpClient

  processPayment() {
    console.log('💳 Processing Payment:', this.payment);
    
    this.http.post('http://localhost:8080/api/payments', this.payment).subscribe(response => {
      console.log("✅ Payment processed:", response);
      alert('Payment processed successfully!');
    });
  }
}
