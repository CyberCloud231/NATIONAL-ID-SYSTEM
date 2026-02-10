
import { Injectable } from '@angular/core';
import { firstValueFrom, of, throwError } from 'rxjs';
import { delay } from 'rxjs/operators';

@Injectable({ providedIn: 'root' })
export class CaptchaService {
  private current: { id: string; text: string } | null = null;

  async getCaptcha() {
    const id = 'cpt_' + Math.random().toString(36).slice(2, 10);
    const charset = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
    const text = Array.from({ length: 6 }, () => charset[Math.floor(Math.random() * charset.length)]).join('');
    this.current = { id, text };

    const svg = `
<svg xmlns="http://www.w3.org/2000/svg" width="160" height="56">
  <rect width="100%" height="100%" fill="#E3F2FD"/>
  <g font-family="monospace" font-size="26" fill="#0D47A1">
    <text x="50%" y="50%" dominant-baseline="middle" text-anchor="middle">${text}</text>
  </g>
</svg>`.trim();
    const image = 'data:image/svg+xml;base64,' + btoa(svg);

    return firstValueFrom(of({
      captchaId: id,
      image,
      ttlSeconds: 120,
      config: { length: 6, caseSensitive: false }
    }).pipe(delay(200)));
  }

  // Mock verify to mimic server
  async verifyMock(captchaId: string, answer: string) {
    if (!this.current || this.current.id !== captchaId) {
      return firstValueFrom(throwError(() => ({ status: 401, error: 'captcha_expired' })).pipe(delay(150)));
    }
    const a = (answer || '').toUpperCase();
    const t = this.current.text.toUpperCase();
    if (a !== t) {
      return firstValueFrom(throwError(() => ({ status: 401, error: 'captcha_mismatch' })).pipe(delay(150)));
    }
    return true;
  }
}
