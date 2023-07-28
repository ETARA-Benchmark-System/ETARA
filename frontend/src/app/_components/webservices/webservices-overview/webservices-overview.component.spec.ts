import { ComponentFixture, TestBed } from '@angular/core/testing';

import { WebservicesOverviewComponent } from './webservices-overview.component';

describe('WebservicesOverviewComponent', () => {
  let component: WebservicesOverviewComponent;
  let fixture: ComponentFixture<WebservicesOverviewComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ WebservicesOverviewComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(WebservicesOverviewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
