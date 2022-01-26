import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { ExternalServicesComponent } from './external-services.component';

describe('ExternalServicesComponent', () => {
  let component: ExternalServicesComponent;
  let fixture: ComponentFixture<ExternalServicesComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ ExternalServicesComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ExternalServicesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
