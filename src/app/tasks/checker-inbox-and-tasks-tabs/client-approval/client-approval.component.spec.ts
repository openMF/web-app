import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { ClientApprovalComponent } from './client-approval.component';

describe('ClientApprovalComponent', () => {
  let component: ClientApprovalComponent;
  let fixture: ComponentFixture<ClientApprovalComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ ClientApprovalComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ClientApprovalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
