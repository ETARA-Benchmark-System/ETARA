import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AlignmentViewerComponent } from './alignment-viewer.component';

describe('AlignmentViewerComponent', () => {
  let component: AlignmentViewerComponent;
  let fixture: ComponentFixture<AlignmentViewerComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ AlignmentViewerComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(AlignmentViewerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
