import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { RouterModule, RouterOutlet } from "@angular/router";

@Component({
  selector: 'app-system-layout',
  imports: [RouterOutlet,CommonModule,RouterModule],
  templateUrl: './system-layout.html',
  styleUrl: './system-layout.css',
})
export class SystemLayout {

}
