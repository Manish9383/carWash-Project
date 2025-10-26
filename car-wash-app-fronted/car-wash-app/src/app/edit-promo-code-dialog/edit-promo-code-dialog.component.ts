// src/app/edit-promo-code-dialog/edit-promo-code-dialog.component.ts
import { Component, Inject } from '@angular/core';
import { MatDialogModule, MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { FormsModule, ReactiveFormsModule, FormGroup, FormBuilder, Validators } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { PromoCode } from '../services/promo-code.service';

@Component({
  selector: 'app-edit-promo-code-dialog',
  standalone: true,
  imports: [
    CommonModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatButtonModule,
    FormsModule,
    ReactiveFormsModule,
  ],
  template: `
    <h2 mat-dialog-title>{{ data.promoCode ? 'Edit Promo Code' : 'Add Promo Code' }}</h2>
    <mat-dialog-content>
      <form [formGroup]="promoCodeForm" (ngSubmit)="onSubmit()">
        <mat-form-field appearance="fill">
          <mat-label>Code</mat-label>
          <input matInput formControlName="code" required />
          <mat-error *ngIf="promoCodeForm.get('code')?.hasError('required')">
            Code is required
          </mat-error>
        </mat-form-field>
        <mat-form-field appearance="fill">
          <mat-label>Discount Type</mat-label>
          <mat-select formControlName="discountType" required>
            <mat-option value="PERCENTAGE">Percentage</mat-option>
            <mat-option value="FIXED">Fixed</mat-option>
          </mat-select>
          <mat-error *ngIf="promoCodeForm.get('discountType')?.hasError('required')">
            Discount Type is required
          </mat-error>
        </mat-form-field>
        <mat-form-field appearance="fill">
          <mat-label>Discount Value</mat-label>
          <input matInput type="number" formControlName="discountValue" required />
          <mat-error *ngIf="promoCodeForm.get('discountValue')?.hasError('required')">
            Discount Value is required
          </mat-error>
          <mat-error *ngIf="promoCodeForm.get('discountValue')?.hasError('min')">
            Discount Value must be positive
          </mat-error>
        </mat-form-field>
        <div class="form-container">
          <label>Expiry Date (Optional)</label>
          <input
            type="datetime-local"
            formControlName="expiryDate"
            name="expiryDate"
            [min]="minDate"
            step="60"
            class="plain-input"
          />
        </div>
        <mat-form-field appearance="fill">
          <mat-label>Max Uses (Optional)</mat-label>
          <input matInput type="number" formControlName="maxUses" />
          <mat-error *ngIf="promoCodeForm.get('maxUses')?.hasError('min')">
            Max Uses must be positive
          </mat-error>
        </mat-form-field>
        <mat-dialog-actions>
          <button mat-button (click)="onCancel()">Cancel</button>
          <button mat-raised-button color="primary" type="submit" [disabled]="promoCodeForm.invalid">
            {{ data.promoCode ? 'Update' : 'Add' }}
          </button>
        </mat-dialog-actions>
      </form>
    </mat-dialog-content>
  `,
  styles: [
    `
      mat-form-field {
        width: 100%;
        margin-bottom: 10px;
      }
      mat-dialog-actions {
        justify-content: flex-end;
      }
      .form-container {
        margin-bottom: 16px;
      }
      .plain-input {
        width: 100%;
        padding: 8px;
        font-size: 16px;
        border: 1px solid #ccc;
        border-radius: 4px;
      }
      .plain-input:focus {
        outline: none;
        border-color: #3f51b5;
        box-shadow: 0 0 5px rgba(63, 81, 181, 0.5);
      }
    `,
  ],
})
export class EditPromoCodeDialogComponent {
  promoCodeForm: FormGroup;
  minDate: string;

  constructor(
    private fb: FormBuilder,
    public dialogRef: MatDialogRef<EditPromoCodeDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { promoCode?: PromoCode }
  ) {
    // Set minDate to current date and time
    this.minDate = this.formatDateForInput(new Date());
    this.promoCodeForm = this.fb.group({
      code: [data.promoCode?.code || '', Validators.required],
      discountType: [data.promoCode?.discountType || '', Validators.required],
      discountValue: [data.promoCode?.discountValue || '', [Validators.required, Validators.min(0)]],
      expiryDate: [data.promoCode?.expiryDate ? this.formatDateForInput(new Date(data.promoCode.expiryDate)) : null],
      maxUses: [data.promoCode?.maxUses || null, Validators.min(0)],
    });
  }

  onSubmit() {
    if (this.promoCodeForm.valid) {
      const formValue = this.promoCodeForm.value;
      // Convert expiryDate to ISO string for backend
      formValue.expiryDate = formValue.expiryDate ? new Date(formValue.expiryDate).toISOString() : null;
      this.dialogRef.close(formValue);
    }
  }

  onCancel() {
    this.dialogRef.close();
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