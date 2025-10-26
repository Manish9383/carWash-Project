import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';

@Component({
  selector: 'app-oauth-redirect',
  template: '<p>Redirecting...</p>'
})
export class OAuthRedirectComponent implements OnInit {
  constructor(private route: ActivatedRoute, private router: Router) {}

  ngOnInit() {
    this.route.queryParams.subscribe(params => {
      const token = params['token'];
      if (token) {
        localStorage.setItem('authToken', token); // Store token
        this.router.navigate(['/home']);  // Redirect to home
      } else {
        this.router.navigate(['/login']); // If no token, go to login
      }
    });
  }
}
