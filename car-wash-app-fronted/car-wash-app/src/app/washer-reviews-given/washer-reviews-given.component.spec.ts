import { ComponentFixture, TestBed } from '@angular/core/testing';

import { WasherReviewsGivenComponent } from './washer-reviews-given.component';

describe('WasherReviewsGivenComponent', () => {
  let component: WasherReviewsGivenComponent;
  let fixture: ComponentFixture<WasherReviewsGivenComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [WasherReviewsGivenComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(WasherReviewsGivenComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
