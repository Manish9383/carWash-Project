import { Component, Inject } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { CommonModule } from '@angular/common';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatDialogModule } from '@angular/material/dialog';
import { ReactiveFormsModule } from '@angular/forms';

// Define User interface locally to avoid import issues
export interface User {
  id: string;
  fullName: string;
  email: string;
  phone?: string;
  role: string;
  active: boolean;
  serviceStatus?: string;
}

@Component({
  selector: 'app-edit-washer-dialog',
  standalone: true,
  imports: [
    CommonModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatButtonModule,
    MatDialogModule,
    ReactiveFormsModule,
  ],
  templateUrl: './edit-washer-dialog.component.html',
  styleUrls: ['./edit-washer-dialog.component.scss'],
})
export class EditWasherDialogComponent {
  editWasherForm: FormGroup;

  constructor(
    private fb: FormBuilder,
    public dialogRef: MatDialogRef<EditWasherDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: User
  ) {
    this.editWasherForm = this.fb.group({
      fullName: [data.fullName, Validators.required],
      email: [data.email, [Validators.required, Validators.email]],
      phone: [data.phone || '', Validators.pattern(/^\d{10}$/)],
      serviceStatus: [data.serviceStatus || 'OFFLINE'],
    });
  }

  closeDialog() {
    this.dialogRef.close();
  }

  saveWasher() {
    if (this.editWasherForm.valid) {
      this.dialogRef.close(this.editWasherForm.value);
    }
  }
}