import { Component, EventEmitter, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CaptchaService } from '../ApplicationServices/captcha.service';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-captcha',
  standalone: true,
  imports: [CommonModule, MatIconModule],
  template: `
    <div class="wrap">
      <img [src]="image" alt="CAPTCHA" (click)="refresh()" [class.dim]="loading">
      <button type="button" class="link" (click)="refresh()" [disabled]="loading">
        <mat-icon>refresh</mat-icon> Refresh
      </button>
      <div class="ttl" *ngIf="ttlSeconds">~{{ ttlSeconds }}s</div>
    </div>
  `,
  styles: [`
    .wrap { display:flex; align-items:center; gap:8px; flex-wrap:wrap; }
    img { height:56px; border:1px dashed #90caf9; background:#f7fbff; cursor:pointer; }
    img.dim { opacity: 0.6; }
    .link { background:none; border:none; color:#1565C0; cursor:pointer; display:flex; align-items:center; gap:4px; }
    .ttl { color:#666; font-size:12px; }
  `]
})
export class CaptchaComponent {
  @Output() changed = new EventEmitter<{ captchaId: string }>();
  image = ''; ttlSeconds?: number; loading = false;

  constructor(private svc: CaptchaService) {}
  async ngOnInit() { await this.refresh(); }
  async refresh() {
    this.loading = true;
    try {
      const res = await this.svc.getCaptcha();
      this.image = res.image;
      this.ttlSeconds = res.ttlSeconds;
      this.changed.emit({ captchaId: res.captchaId });
    } finally { this.loading = false; }
  }
}
