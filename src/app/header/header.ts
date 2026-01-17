import { CommonModule } from '@angular/common';
import { Component, HostListener } from '@angular/core';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-header',
  imports: [RouterModule,CommonModule],
  templateUrl: './header.html',
  styleUrl: './header.css',
})
export class Header {
  isSideNavOpen = false;

  @HostListener('window:resize')
  onResize() {
    if (window.innerWidth >= 768) {
      this.isSideNavOpen = false;
    }
  }
}

