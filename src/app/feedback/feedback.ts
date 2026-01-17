import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-feedback',
  imports: [CommonModule,RouterModule],
  templateUrl: './feedback.html',
  styleUrl: './feedback.css',
})
export class Feedback {

}
