import { ComponentFixture, TestBed } from '@angular/core/testing';

import { NavbarComponent } from './navbar.component';

describe('NavbarComponent', () => {
  let component: NavbarComponent;
  let fixture: ComponentFixture<NavbarComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [NavbarComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(NavbarComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});


// import { ComponentFixture, TestBed } from '@angular/core/testing';

// import { AppNavbarComponent } from './navbar.component'; // Corrected import to AppNavbarComponent

// describe('AppNavbarComponent', () => {
//   let component: AppNavbarComponent;
//   let fixture: ComponentFixture<AppNavbarComponent>;

//   beforeEach(async () => {
//     await TestBed.configureTestingModule({
//       imports: [AppNavbarComponent] // Corrected to AppNavbarComponent
//     })
//     .compileComponents();

//     fixture = TestBed.createComponent(AppNavbarComponent); // Create the component instance
//     component = fixture.componentInstance;
//     fixture.detectChanges(); // Trigger change detection
//   });

//   it('should create', () => {
//     expect(component).toBeTruthy(); // Check if the component is created successfully
//   });
// });
