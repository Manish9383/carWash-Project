import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EditServicePlanDialogComponent } from './edit-service-plan-dialog.component';

describe('EditServicePlanDialogComponent', () => {
  let component: EditServicePlanDialogComponent;
  let fixture: ComponentFixture<EditServicePlanDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EditServicePlanDialogComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(EditServicePlanDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
