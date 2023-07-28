import { ComponentFixture, TestBed } from '@angular/core/testing';

import { WebserviceInformationComponent } from './webservice-information.component';

describe('WebserviceInformationComponent', () => {
  let component: WebserviceInformationComponent;
  let fixture: ComponentFixture<WebserviceInformationComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ WebserviceInformationComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(WebserviceInformationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
