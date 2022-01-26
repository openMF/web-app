import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { TransferClientComponent } from './transfer-client.component';

describe('TransferClientComponent', () => {
  let component: TransferClientComponent;
  let fixture: ComponentFixture<TransferClientComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ TransferClientComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(TransferClientComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
