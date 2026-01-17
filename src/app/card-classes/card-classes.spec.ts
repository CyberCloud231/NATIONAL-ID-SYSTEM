import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CardClasses } from './card-classes';

describe('CardClasses', () => {
  let component: CardClasses;
  let fixture: ComponentFixture<CardClasses>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CardClasses]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CardClasses);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
