import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatDialogRef, MatDialogModule } from '@angular/material/dialog';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { UserService } from '../services/user.service';

@Component({
  selector: 'app-add-washer-dialog',
  standalone: true,
  imports: [CommonModule, MatDialogModule, ReactiveFormsModule, MatFormFieldModule, MatInputModule, MatButtonModule, MatIconModule],
  templateUrl: './add-washer-dialog.component.html',
  styleUrls: ['./add-washer-dialog.component.scss']
})
export class AddWasherDialogComponent {
  private fb = inject(FormBuilder);
  private userService = inject(UserService);
  private dialogRef = inject(MatDialogRef<AddWasherDialogComponent>);

  form = this.fb.group({
    fullName: ['', Validators.required],
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(6)]],
    phone: ['', [Validators.pattern(/^\d{10}$/)]],
  });

  isLoading = false;
  errorMessage: string | null = null;

  submit() {
    if (this.form.invalid) return;
    this.isLoading = true;
    this.errorMessage = null;
    const v = this.form.value;
    const payload = {
      role: 'WASHER',
      active: true,
      fullName: (v.fullName || '').toString(),
      email: (v.email || '').toString(),
      password: (v.password || '').toString(),
      phone: (v.phone || '').toString(),
    };
    this.userService.createUser(payload).subscribe({
      next: (res) => {
        this.isLoading = false;
        this.dialogRef.close({ success: true, washer: res });
      },
      error: (err) => {
        this.isLoading = false;
        this.errorMessage = err.message || 'Failed to add washer';
      }
    });
  }

  cancel() {
    this.dialogRef.close({ success: false });
  }
}
