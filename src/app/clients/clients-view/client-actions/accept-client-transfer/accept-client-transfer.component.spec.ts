import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AcceptClientTransferComponent } from './accept-client-transfer.component';

describe('AcceptClientTransferComponent', () => {
  let component: AcceptClientTransferComponent;
  let fixture: ComponentFixture<AcceptClientTransferComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ AcceptClientTransferComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AcceptClientTransferComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
