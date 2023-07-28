import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ApiCreateFormComponent } from './api-create-form.component';

describe('ApiCreateFormComponent', () => {
  let component: ApiCreateFormComponent;
  let fixture: ComponentFixture<ApiCreateFormComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ApiCreateFormComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ApiCreateFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
