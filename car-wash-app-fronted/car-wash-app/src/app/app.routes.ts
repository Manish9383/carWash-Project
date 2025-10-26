
import { Routes } from '@angular/router';
import { HomeComponent } from './pages/home/home.component';
import { LoginComponent } from './pages/login/login.component';
import { RegisterComponent } from './pages/register/register.component';
import { BookServiceComponent } from './pages/book-service/book-service.component';
import { ProfileComponent } from './pages/profile/profile.component';
import { AdminDashboardComponent } from './pages/admin-dashboard/admin-dashboard.component';
import { BookingHistoryComponent } from './pages/booking-history/booking-history.component';
import { PaymentComponent } from './pages/payment/payment.component';
import { PaymentDetailsComponent } from './pages/payment-details/payment-details.component';
import { authGuard } from './guards/auth.guard';
import { OAuthRedirectComponent } from './pages/oauth-redirect/oauth-redirect.component';
import { ReceiptComponent } from './receipt/receipt.component';
import { ReviewsComponent } from './pages/reviews/reviews.component';
import { WasherDashboardComponent } from './washer-dashboard/washer-dashboard.component';
import { WasherReviewsComponent } from './washer-reviews/washer-reviews.component';
import { WasherProfileComponent } from './washer-profile/washer-profile.component';
import { WasherReviewsGivenComponent } from './washer-reviews-given/washer-reviews-given.component';
import { EditProfileComponent } from './pages/edit-profile/edit-profile.component';

export const routes: Routes = [
  { path: '', redirectTo: 'home', pathMatch: 'full' },
  { path: 'home', component: HomeComponent },
  { path: 'login', component: LoginComponent },
  { path: 'register', component: RegisterComponent },
  { path: 'payment-details', component: PaymentDetailsComponent },
  { path: 'book-service', component: BookServiceComponent, canActivate: [authGuard] },
  { path: 'profile', component: ProfileComponent, canActivate: [authGuard] },
  { path: 'admin-dashboard', component: AdminDashboardComponent, canActivate: [authGuard] },
  { path: 'booking-history', loadComponent: () => import('./pages/booking-history/booking-history.component').then(m => m.BookingHistoryComponent), canActivate: [authGuard] },
  { path: 'washer-dashboard', component: WasherDashboardComponent, canActivate: [authGuard] },
  { path: 'payment', component: PaymentComponent, canActivate: [authGuard] },
  { path: 'my-orders', loadComponent: () => import('./pages/booking-history/booking-history.component').then(m => m.BookingHistoryComponent), canActivate: [authGuard] },
  { path: 'receipt', component: ReceiptComponent, canActivate: [authGuard] },
  { path: 'reviews/:bookingId/:washerId', component: ReviewsComponent, canActivate: [authGuard] },
  { path: 'washer-reviews/:bookingId/:customerId', component: WasherReviewsComponent, canActivate: [authGuard] },
  { path: 'washer-profile', component: WasherProfileComponent, canActivate: [authGuard] },
  { path: 'washer-reviews-given', component: WasherReviewsGivenComponent, canActivate: [authGuard] },
  { path: 'edit-profile', component: EditProfileComponent, canActivate: [authGuard] },
  { path: 'edit-profile/:id', component: EditProfileComponent, canActivate: [authGuard] }, 
  { path: 'oauth-redirect', component: OAuthRedirectComponent },
  { path: '**', redirectTo: 'home' },
];