import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MakeAccountInterbankTransfersComponent } from './make-account-interbank-transfers.component';

describe('MakeAccountInterbankTransfersComponent', () => {
  let component: MakeAccountInterbankTransfersComponent;
  let fixture: ComponentFixture<MakeAccountInterbankTransfersComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [MakeAccountInterbankTransfersComponent]
    }).compileComponents();

    fixture = TestBed.createComponent(MakeAccountInterbankTransfersComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
