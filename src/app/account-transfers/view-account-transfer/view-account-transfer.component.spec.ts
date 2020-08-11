import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ViewAccountTransferComponent } from './view-account-transfer.component';

describe('ViewAccountTransferComponent', () => {
  let component: ViewAccountTransferComponent;
  let fixture: ComponentFixture<ViewAccountTransferComponent>;

  beforeEach(async(() => {
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
