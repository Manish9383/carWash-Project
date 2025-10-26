import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EditWasherDialogComponent } from './edit-washer-dialog.component';

describe('EditWasherDialogComponent', () => {
  let component: EditWasherDialogComponent;
  let fixture: ComponentFixture<EditWasherDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EditWasherDialogComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(EditWasherDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
