import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DatabasesOverviewComponent } from './databases-overview.component';

describe('DatabasesOverviewComponent', () => {
  let component: DatabasesOverviewComponent;
  let fixture: ComponentFixture<DatabasesOverviewComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ DatabasesOverviewComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(DatabasesOverviewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
