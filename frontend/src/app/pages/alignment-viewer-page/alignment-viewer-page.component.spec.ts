import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AlignmentViewerPageComponent } from './alignment-viewer-page.component';

describe('AlignmentViewerPageComponent', () => {
  let component: AlignmentViewerPageComponent;
  let fixture: ComponentFixture<AlignmentViewerPageComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ AlignmentViewerPageComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(AlignmentViewerPageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
