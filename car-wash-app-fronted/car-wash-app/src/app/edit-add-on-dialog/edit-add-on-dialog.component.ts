import { Component, Inject } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { AddOn } from '../services/booking.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-edit-add-on-dialog',
  standalone: true,
  imports: [
    CommonModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    ReactiveFormsModule,
  ],
  templateUrl: './edit-add-on-dialog.component.html',
  styleUrls: ['./edit-add-on-dialog.component.scss'],
})
export class EditAddOnDialogComponent {
  addOnForm: FormGroup;
  isEditMode: boolean;

  constructor(
    private fb: FormBuilder,
    public dialogRef: MatDialogRef<EditAddOnDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { addOn?: AddOn }
  ) {
    this.isEditMode = !!data.addOn;
    this.addOnForm = this.fb.group({
      name: [data.addOn?.name || '', Validators.required],
      price: [data.addOn?.price || '', [Validators.required, Validators.min(0)]],
    });
  }

  onSubmit() {
    if (this.addOnForm.valid) {
      this.dialogRef.close(this.addOnForm.value);
    }
  }

  onCancel() {
    this.dialogRef.close();
  }
}