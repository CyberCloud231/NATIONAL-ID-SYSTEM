import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Anouncements } from './anouncements';

describe('Anouncements', () => {
  let component: Anouncements;
  let fixture: ComponentFixture<Anouncements>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Anouncements]
    })
    .compileComponents();

    fixture = TestBed.createComponent(Anouncements);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
