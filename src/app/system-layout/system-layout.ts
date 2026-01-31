import { Component } from '@angular/core';
import { ActivatedRoute, NavigationEnd, Router, RouterOutlet } from '@angular/router';
import { filter } from 'rxjs/operators';
import { CommonModule } from '@angular/common';
import { Footer } from '../footer/footer';
import { Header } from '../header/header';

@Component({
  selector: 'app-system-layout',
  standalone: true,
  imports: [CommonModule, Footer, Header, RouterOutlet],
  templateUrl: './system-layout.html',
  styleUrls: ['./system-layout.css']
})
export class SystemLayout {
  showHeader = false;

  constructor(private router: Router, private route: ActivatedRoute) {
    this.router.events
      .pipe(filter(event => event instanceof NavigationEnd))
      .subscribe(() => {
        const child = this.route.firstChild;
        this.showHeader = child?.snapshot.data['showHeader'] === true;
      });
  }
}
