import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ClientScreenReportsComponent } from './client-screen-reports.component';

describe('ClientScreenReportsComponent', () => {
  let component: ClientScreenReportsComponent;
  let fixture: ComponentFixture<ClientScreenReportsComponent>;

  beforeEach(async(() => {
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
