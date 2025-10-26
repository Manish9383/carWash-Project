import { ComponentFixture, TestBed } from '@angular/core/testing';

import { WasherReviewsComponent } from './washer-reviews.component';

describe('WasherReviewsComponent', () => {
  let component: WasherReviewsComponent;
  let fixture: ComponentFixture<WasherReviewsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [WasherReviewsComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(WasherReviewsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
