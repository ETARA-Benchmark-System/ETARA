import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AlignmentSelectorComponent } from './alignment-selector.component';

describe('DataSelectorComponent', () => {
  let component: AlignmentSelectorComponent;
  let fixture: ComponentFixture<AlignmentSelectorComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ AlignmentSelectorComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(AlignmentSelectorComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
