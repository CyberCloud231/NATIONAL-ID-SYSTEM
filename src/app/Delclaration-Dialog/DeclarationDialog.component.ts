import { Component } from '@angular/core';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatButtonModule } from '@angular/material/button';
import { FormsModule } from '@angular/forms';

@Component({
  standalone: true,
  selector: 'app-declaration-dialog',
  imports: [
    MatDialogModule,
    MatCheckboxModule,
    MatButtonModule,
    FormsModule
  ],
  template: `
    <h2 mat-dialog-title>Declaration</h2>

    <mat-dialog-content>
      <p>
        I hereby declare that all information provided in this application
        is accurate, complete, and correct to the best of my knowledge.
      </p>

      <mat-checkbox [(ngModel)]="agreed">
        I agree to the declaration
      </mat-checkbox>
    </mat-dialog-content>

    <mat-dialog-actions align="end">
      <button mat-button mat-dialog-close>Cancel</button>
      <button
        mat-raised-button
        color="primary"
        [disabled]="!agreed"
        (click)="confirm()">
        Submit
      </button>
    </mat-dialog-actions>
  `
})
export class DeclarationDialogComponent {
  agreed = false;

  constructor(private dialog: MatDialog) {}

  confirm() {
    this.dialog.closeAll();
  }
}
