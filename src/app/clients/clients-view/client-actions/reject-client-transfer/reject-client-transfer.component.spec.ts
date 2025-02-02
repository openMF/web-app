import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { RejectClientTransferComponent } from './reject-client-transfer.component';
import { ReactiveFormsModule } from '@angular/forms';

describe('RejectClientTransferComponent', () => {
  let component: RejectClientTransferComponent;
  let fixture: ComponentFixture<RejectClientTransferComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [RejectClientTransferComponent],
      imports: [ReactiveFormsModule]
    }).compileComponents();
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
