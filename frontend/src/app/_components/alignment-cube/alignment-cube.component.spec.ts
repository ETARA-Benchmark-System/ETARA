import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AlignmentCubeComponent } from './alignment-cube.component';

describe('AlignmentCubeComponent', () => {
  let component: AlignmentCubeComponent;
  let fixture: ComponentFixture<AlignmentCubeComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ AlignmentCubeComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(AlignmentCubeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
