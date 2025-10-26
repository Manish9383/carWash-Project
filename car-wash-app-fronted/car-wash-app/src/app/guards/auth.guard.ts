

import { CanActivateFn, Router } from '@angular/router';
import { inject } from '@angular/core';

export const authGuard: CanActivateFn = (route, state) => {
  const router = inject(Router);
  
  //  Check if JWT token exists
  const token = localStorage.getItem('token');  

  if (token) {
    return true; //  User is authenticated
  } else {
    router.navigate(['/login']); //  redirect to login
    return false;
  }
};
