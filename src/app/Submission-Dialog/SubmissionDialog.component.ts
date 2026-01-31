import { Component, Inject } from '@angular/core';
import {
  MAT_DIALOG_DATA,
  MatDialogContent,
  MatDialogActions,
  MatDialogModule
} from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';

@Component({
  standalone: true,
  selector: 'app-submission-success-dialog',
  imports: [
    MatDialogModule,
    MatDialogContent,
    MatDialogActions,
    MatButtonModule
  ],
  template: `
    <h2 mat-dialog-title>Application Submitted</h2>

    <mat-dialog-content>
      <p>Your application has been successfully submitted.</p>

      <p class="fw-semibold">
        Application ID:
        <span class="text-primary">{{ data.applicationId }}</span>
      </p>

      <p>Please keep this ID to print or track your application.</p>
    </mat-dialog-content>

    <mat-dialog-actions align="end">
      <button mat-raised-button color="primary" mat-dialog-close>
        OK
      </button>
    </mat-dialog-actions>
  `
})
export class SubmissionSuccessDialog {
  constructor(
    @Inject(MAT_DIALOG_DATA)
    public data: { applicationId: string }
  ) {}
}
