import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { Router, RouterModule } from '@angular/router';

@Component({
  selector: 'app-auth-signup',
  imports: [CommonModule,RouterModule],
  templateUrl: './auth-signup.html',
  styleUrl: './auth-signup.css',
})
export class AuthSignup {
onSubmit() {
throw new Error('Method not implemented.');
}

}
