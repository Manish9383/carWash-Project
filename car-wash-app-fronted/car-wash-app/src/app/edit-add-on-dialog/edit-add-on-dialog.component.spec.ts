import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EditAddOnDialogComponent } from './edit-add-on-dialog.component';

describe('EditAddOnDialogComponent', () => {
  let component: EditAddOnDialogComponent;
  let fixture: ComponentFixture<EditAddOnDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EditAddOnDialogComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(EditAddOnDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
