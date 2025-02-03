import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { MakeAccountTransfersComponent } from './make-account-transfers.component';
import { ReactiveFormsModule } from '@angular/forms';
import { RouterTestingModule } from '@angular/router/testing';

describe('MakeAccountTransfersComponent', () => {
  let component: MakeAccountTransfersComponent;
  let fixture: ComponentFixture<MakeAccountTransfersComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [MakeAccountTransfersComponent],
      imports: [
        ReactiveFormsModule,
        RouterTestingModule
      ]
    }).compileComponents();
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
