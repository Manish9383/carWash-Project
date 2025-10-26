import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-home',
  standalone: true,
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss'],
  imports: []
})
export class HomeComponent implements OnInit, OnDestroy {
  private observer: IntersectionObserver | null = null;

  constructor(private router: Router) {}

  ngOnInit() {
    this.initScrollAnimations();
  }

  ngOnDestroy() {
    if (this.observer) {
      this.observer.disconnect();
    }
  }

  private initScrollAnimations() {
    const animatedElements = document.querySelectorAll('.animate-on-scroll');

    const options = {
      threshold: 0.1,
      rootMargin: '0px 0px -50px 0px'
    };

    this.observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('animate');
        }
      });
    }, options);

    animatedElements.forEach(element => {
      this.observer?.observe(element);
    });
  }

  goToBookService() {
    this.router.navigate(['/book-service']);
  }

  goToCarDetails() {
    this.router.navigate(['/car-details']);
  }

  goToPaymentDetails() {
    this.router.navigate(['/payment-details']);
  }

  logout() {
    sessionStorage.clear();
    localStorage.removeItem('authToken');
    alert('✅ Logged out successfully');
    this.router.navigate(['/login']);
  }

  scrollToFeatures() {
    const featuresSection = document.getElementById('features');
    if (featuresSection) {
      featuresSection.scrollIntoView({ behavior: 'smooth' });
    }
  }
}
