import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { ResumeTokenService } from '../auth/resume-token.service.ts';
import { firstValueFrom, of, throwError } from 'rxjs';
import { delay } from 'rxjs/operators';
import { environment } from '../Environments/environment.development.js';


@Injectable({ providedIn: 'root' })
export class ApplicationsService {
  constructor(private http: HttpClient, private tokenSvc: ResumeTokenService) {}

  async startResume(tempAppId: string, captchaId: string, captchaAnswer: string) {
    if (environment.mockApi) {
      // Local checks + mock response
      if (!/^[A-Za-z0-9]{8,16}$/.test(tempAppId)) {
        return firstValueFrom(throwError(() => ({ status: 400, error: 'invalid_temp_id' })).pipe(delay(250)));
      }
      if (!captchaAnswer || captchaAnswer.length < 3 || !captchaId) {
        return firstValueFrom(throwError(() => ({ status: 401, error: 'captcha_failed' })).pipe(delay(250)));
      }
      const mock = {
        applicationId: this.randomId(),
        resumeToken: 'mock-token-' + Math.random().toString(36).slice(2),
        expiresInSeconds: 1800,
        prefill: {
          personal: { firstName: 'Asha', lastName: 'Singh', dob: '1995-04-12' },
          contact: { email: 'a***@example.com', phone: '********98' },
          address: { state: 'Punjab', district: 'Ludhiana', city: 'Khanna', pincode: '141401' },
          progress: { currentStep: 2, completedSections: ['personal'] }
        }
      };
      this.tokenSvc.set({
        token: mock.resumeToken, appId: mock.applicationId, prefill: mock.prefill, expiresInSeconds: mock.expiresInSeconds
      });
      return firstValueFrom(of(mock).pipe(delay(500)));
    }

    // Backend (later): server verifies captchaId + captchaAnswer + tempAppId
    const res: any = await firstValueFrom(
      this.http.post('/api/v1/applications/resume/start', {
        tempAppId, captchaId, captchaAnswer
      })
    );
    this.tokenSvc.set({
      token: res.resumeToken, appId: res.applicationId, prefill: res.prefill, expiresInSeconds: res.expiresInSeconds
    });
    return res;
  }

  async saveSection(appId: string, section: string, data: any, currentStep: number) {
    if (environment.mockApi) {
      return firstValueFrom(of({ ok: true, version: Date.now(), updatedAt: new Date().toISOString() }).pipe(delay(250)));
    }
    return firstValueFrom(this.http.patch(`/api/v1/applications/${appId}`, { section, data, currentStep }));
  }

  async submit(appId: string) {
    if (environment.mockApi) {
      return firstValueFrom(of({ ok: true, status: 'submitted', submittedAt: new Date().toISOString() }).pipe(delay(400)));
    }
    return firstValueFrom(this.http.post(`/api/v1/applications/${appId}/submit`, {}));
  }

  private randomId() {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, c => {
      const r = (Math.random() * 16) | 0;
      const v = c === 'x' ? r : (r & 0x3) | 0x8;
      return v.toString(16);
    });
  }
}
