import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EditPromoCodeDialogComponent } from './edit-promo-code-dialog.component';

describe('EditPromoCodeDialogComponent', () => {
  let component: EditPromoCodeDialogComponent;
  let fixture: ComponentFixture<EditPromoCodeDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EditPromoCodeDialogComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(EditPromoCodeDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
