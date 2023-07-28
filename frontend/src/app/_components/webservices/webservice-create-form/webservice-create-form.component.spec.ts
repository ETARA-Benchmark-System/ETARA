import { ComponentFixture, TestBed } from '@angular/core/testing';

import { WebserviceCreateFormComponent } from './webservice-create-form.component';

describe('WebserviceCreateFormComponent', () => {
  let component: WebserviceCreateFormComponent;
  let fixture: ComponentFixture<WebserviceCreateFormComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ WebserviceCreateFormComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(WebserviceCreateFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
