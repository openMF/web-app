import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { MakeAccountTransfersComponent } from './make-account-transfers.component';

describe('MakeAccountTransfersComponent', () => {
  let component: MakeAccountTransfersComponent;
  let fixture: ComponentFixture<MakeAccountTransfersComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ MakeAccountTransfersComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(MakeAccountTransfersComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
