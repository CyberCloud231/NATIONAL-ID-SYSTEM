import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DocRequirements } from './doc-requirements';

describe('DocRequirements', () => {
  let component: DocRequirements;
  let fixture: ComponentFixture<DocRequirements>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DocRequirements]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DocRequirements);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
