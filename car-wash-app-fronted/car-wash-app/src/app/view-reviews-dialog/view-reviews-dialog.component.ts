import { Component, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatDialogModule, MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatTableModule, MatTableDataSource } from '@angular/material/table';
import { User } from '../services/user.service';
import { Review } from '../services/review.service';

export interface DialogData {
  user: User;
  reviews: Review[];
  role: 'WASHER' | 'CUSTOMER';
}

@Component({
  selector: 'app-view-reviews-dialog',
  standalone: true,
  imports: [
    CommonModule,
    MatDialogModule,
    MatButtonModule,
    MatTableModule,
  ],
  templateUrl: './view-reviews-dialog.component.html',
  styleUrls: ['./view-reviews-dialog.component.scss'],
})
export class ViewReviewsDialogComponent {
  displayedColumns: string[] = ['reviewerName', 'rating', 'comment', 'bookingId'];
  reviews = new MatTableDataSource<Review>();

  constructor(
    public dialogRef: MatDialogRef<ViewReviewsDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: DialogData
  ) {
    this.reviews.data = this.data.reviews || [];
  }

  closeDialog() {
    this.dialogRef.close();
  }
}