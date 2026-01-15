import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AuthSignup } from './auth-signup';

describe('AuthSignup', () => {
  let component: AuthSignup;
  let fixture: ComponentFixture<AuthSignup>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AuthSignup]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AuthSignup);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
