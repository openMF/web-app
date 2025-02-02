import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { RevertTransactionComponent } from './revert-transaction.component';
import { MatDialogModule } from '@angular/material/dialog';

describe('RevertTransactionComponent', () => {
  let component: RevertTransactionComponent;
  let fixture: ComponentFixture<RevertTransactionComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [RevertTransactionComponent],
      imports: [MatDialogModule]
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(RevertTransactionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
