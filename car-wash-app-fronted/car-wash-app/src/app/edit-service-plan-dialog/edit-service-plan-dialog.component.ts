import { Component, Inject } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { ServicePlan } from '../services/booking.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-edit-service-plan-dialog',
  standalone: true,
  imports: [
    CommonModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    ReactiveFormsModule,
  ],
  templateUrl: './edit-service-plan-dialog.component.html',
  styleUrls: ['./edit-service-plan-dialog.component.scss'],
})
export class EditServicePlanDialogComponent {
  servicePlanForm: FormGroup;
  isEditMode: boolean;

  constructor(
    private fb: FormBuilder,
    public dialogRef: MatDialogRef<EditServicePlanDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { servicePlan?: ServicePlan }
  ) {
    this.isEditMode = !!data.servicePlan;
    this.servicePlanForm = this.fb.group({
      name: [data.servicePlan?.name || '', Validators.required],
      price: [data.servicePlan?.price || '', [Validators.required, Validators.min(0)]],
    });
  }

  onSubmit() {
    if (this.servicePlanForm.valid) {
      this.dialogRef.close(this.servicePlanForm.value);
    }
  }

  onCancel() {
    this.dialogRef.close();
  }
}