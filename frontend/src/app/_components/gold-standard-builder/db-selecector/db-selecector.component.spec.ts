import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DbSelecectorComponent } from './db-selecector.component';

describe('DbSelecectorComponent', () => {
  let component: DbSelecectorComponent;
  let fixture: ComponentFixture<DbSelecectorComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ DbSelecectorComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(DbSelecectorComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
