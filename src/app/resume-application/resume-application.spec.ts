import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ResumeApplication } from './resume-application';

describe('ResumeApplication', () => {
  let component: ResumeApplication;
  let fixture: ComponentFixture<ResumeApplication>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ResumeApplication]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ResumeApplication);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
