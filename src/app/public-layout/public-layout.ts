import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { RouterModule, RouterOutlet } from '@angular/router';
import { Footer } from "../footer/footer";
import { SideNav } from "../side-nav/side-nav";
import { Header } from "../header/header";

@Component({
  selector: 'app-public-layout',
  imports: [RouterOutlet,CommonModule, RouterModule, Footer, SideNav, Header],
  templateUrl: './public-layout.html',
  styleUrl: './public-layout.css',
})
export class PublicLayout {

}
