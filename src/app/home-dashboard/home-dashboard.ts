import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { Router, RouterModule } from '@angular/router';


@Component({
  selector: 'app-home-dashboard',
  imports: [CommonModule, RouterModule,],
  templateUrl: './home-dashboard.html',
  styleUrl: './home-dashboard.css',
})
export class HomeDashboard {

user = {
  name: 'Abraham Darius Paye',
  email: 'info.Neogentechnologies@gmail.com',
  id: 'NIRAL20240012345',
  lastLogin: new Date()
};

menuOpen = false;

toggleMenu() {
  this.menuOpen = !this.menuOpen;
}

goToProfile() {
  this.menuOpen = false;
  // navigate to profile
}

logout() {
  this.menuOpen = false;
  // logout logic
}


}
