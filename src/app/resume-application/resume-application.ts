import { Component } from '@angular/core';
import { CommonModule,} from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { Router, RouterLink, RouterModule } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatIconModule } from '@angular/material/icon';

import { ApplicationsService } from '../ApplicationServices/applicationServices';
import { CaptchaService } from '../ApplicationServices/captcha.service';
import { CaptchaComponent } from '../Captcha/captcha';
import { environment } from '../Environments/environment.development';

@Component({
  selector: 'app-resume-application',
  standalone: true,
  imports: [
    CommonModule, ReactiveFormsModule, RouterModule,
    MatCardModule, MatFormFieldModule, MatInputModule,
    MatButtonModule, MatProgressSpinnerModule, MatIconModule,
    CaptchaComponent
  ],
  templateUrl: './resume-application.html',
  styleUrls: ['./resume-application.css']
})
export class ResumeApplication {
  loading = false;
  error = '';
  captchaId = '';

  form: ReturnType<FormBuilder['group']>;

  constructor(
    private fb: FormBuilder,
    private api: ApplicationsService,
    private captchaSvc: CaptchaService,
    private router: Router
  ) {
    this.form = this.fb.group({
      tempAppId: ['', [Validators.required, Validators.pattern(/^[A-Za-z0-9]{8,16}$/)]],
      captchaAnswer: ['', [Validators.required, Validators.minLength(3)]]
    });
  }

  onCaptchaChanged(e: { captchaId: string }) { this.captchaId = e.captchaId; }

  async onSubmit() {
    if (this.form.invalid || !this.captchaId) return;
    this.loading = true; this.error = '';
    try {
      // In mock mode, check on client for better UX
      if (environment.mockApi) {
        await this.captchaSvc.verifyMock(this.captchaId, this.form.value.captchaAnswer!);
      }
      const res = await this.api.startResume(
        this.form.value.tempAppId!.trim(),
        this.captchaId,
        this.form.value.captchaAnswer!
      );
      // Your current route to the form
      this.router.navigate(['/systemLayout/apply-form'], {
        state: { prefill: res.prefill, applicationId: res.applicationId }
      });
    } catch (e: any) {
      if (e.status === 401) this.error = 'CAPTCHA failed or expired.';
      else if (e.status === 404) this.error = 'Application not found or unavailable.';
      else if (e.status === 423) this.error = 'This application is temporarily locked. Please try again later.';
      else if (e.status === 429) this.error = 'Too many attempts. Please wait and retry.';
      else this.error = 'Something went wrong. Please try again.';
    } finally { this.loading = false; }
  }
}
