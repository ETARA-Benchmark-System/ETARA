import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DataCubePageComponent } from './data-cube-page.component';

describe('DataCubePageComponent', () => {
  let component: DataCubePageComponent;
  let fixture: ComponentFixture<DataCubePageComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ DataCubePageComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(DataCubePageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
