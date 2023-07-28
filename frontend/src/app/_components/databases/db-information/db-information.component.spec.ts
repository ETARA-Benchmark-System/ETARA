import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DbInformationComponent } from './db-information.component';

describe('DbInformationComponent', () => {
  let component: DbInformationComponent;
  let fixture: ComponentFixture<DbInformationComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ DbInformationComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(DbInformationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
