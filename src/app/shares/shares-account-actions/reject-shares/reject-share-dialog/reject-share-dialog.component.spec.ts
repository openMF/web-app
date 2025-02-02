import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { RejectShareDialogComponent } from './reject-share-dialog.component';
import { MatDialogModule } from '@angular/material/dialog';

describe('RejectSharesDialogComponent', () => {
  let component: RejectShareDialogComponent;
  let fixture: ComponentFixture<RejectShareDialogComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [RejectShareDialogComponent],
      imports: [MatDialogModule]
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(RejectShareDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
