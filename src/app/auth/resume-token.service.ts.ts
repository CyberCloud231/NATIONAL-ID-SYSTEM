import { Injectable } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class ResumeTokenService {
  private token: string | null = null;
  private appId: string | null = null;
  private prefill: any = null;
  private expiry: number | null = null;

  set(data: { token: string; appId: string; prefill?: any; expiresInSeconds?: number }) {
    this.token = data.token;
    this.appId = data.appId;
    this.prefill = data.prefill ?? null;
    this.expiry = data.expiresInSeconds ? Date.now() + data.expiresInSeconds * 1000 : null;
  }

  getToken() {
    if (this.expiry && Date.now() > this.expiry) { this.clear(); return null; }
    return this.token;
  }
  getAppId() { return this.appId; }
  getPrefill() { return this.prefill; }
  isValidFor(appId: string) { return !!this.getToken() && this.appId === appId; }
  clear() { this.token = this.appId = null; this.prefill = null; this.expiry = null; }
}
