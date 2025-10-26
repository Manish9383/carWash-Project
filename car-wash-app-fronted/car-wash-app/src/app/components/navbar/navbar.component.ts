
import { Component, Inject, PLATFORM_ID } from '@angular/core';
import { AuthService } from '../../services/auth.service';
import { RouterModule } from '@angular/router';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatButtonModule } from '@angular/material/button';
import { CommonModule } from '@angular/common';
import { isPlatformBrowser } from '@angular/common';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [CommonModule, RouterModule, MatToolbarModule, MatButtonModule],
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.scss'],
})
export class NavbarComponent {
  constructor(
    private authService: AuthService,
    @Inject(PLATFORM_ID) private platformId: object
  ) {}

  isAuthenticated(): boolean {
    return this.authService.isAuthenticated();
  }

  isCustomer(): boolean {
    return isPlatformBrowser(this.platformId) && this.authService.getUserRole() === 'CUSTOMER';
  }

  isWasher(): boolean {
    return isPlatformBrowser(this.platformId) && this.authService.getUserRole() === 'WASHER';
  }

  isAdmin(): boolean {
    return isPlatformBrowser(this.platformId) && this.authService.getUserRole() === 'ADMIN';
  }

  logout() {
    this.authService.logout();
  }
}
