import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ViewReviewsDialogComponent } from './view-reviews-dialog.component';

describe('ViewReviewsDialogComponent', () => {
  let component: ViewReviewsDialogComponent;
  let fixture: ComponentFixture<ViewReviewsDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ViewReviewsDialogComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ViewReviewsDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
