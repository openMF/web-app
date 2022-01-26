import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { ClientScreenReportsComponent } from './client-screen-reports.component';

describe('ClientScreenReportsComponent', () => {
  let component: ClientScreenReportsComponent;
  let fixture: ComponentFixture<ClientScreenReportsComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ ClientScreenReportsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ClientScreenReportsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
