import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DbCreateFormComponent } from './db-create-form.component';

describe('DbCreateFormComponent', () => {
  let component: DbCreateFormComponent;
  let fixture: ComponentFixture<DbCreateFormComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ DbCreateFormComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(DbCreateFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
