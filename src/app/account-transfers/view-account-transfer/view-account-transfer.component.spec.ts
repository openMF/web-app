import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { ViewAccountTransferComponent } from './view-account-transfer.component';

describe('ViewAccountTransferComponent', () => {
  let component: ViewAccountTransferComponent;
  let fixture: ComponentFixture<ViewAccountTransferComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ ViewAccountTransferComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ViewAccountTransferComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
