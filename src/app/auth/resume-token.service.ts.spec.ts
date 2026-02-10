import { TestBed } from '@angular/core/testing';

import { ResumeTokenServiceTs } from './resume-token.service.ts';

describe('ResumeTokenServiceTs', () => {
  let service: ResumeTokenServiceTs;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ResumeTokenServiceTs);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
