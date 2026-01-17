import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ImportantInstructions } from './important-instructions';

describe('ImportantInstructions', () => {
  let component: ImportantInstructions;
  let fixture: ComponentFixture<ImportantInstructions>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ImportantInstructions]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ImportantInstructions);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
