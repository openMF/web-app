import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { RejectClientTransferComponent } from './reject-client-transfer.component';

describe('RejectClientTransferComponent', () => {
  let component: RejectClientTransferComponent;
  let fixture: ComponentFixture<RejectClientTransferComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ RejectClientTransferComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(RejectClientTransferComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
