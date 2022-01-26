import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { RejectShareDialogComponent } from './reject-share-dialog.component';

describe('RejectSharesDialogComponent', () => {
  let component: RejectShareDialogComponent;
  let fixture: ComponentFixture<RejectShareDialogComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ RejectShareDialogComponent ]
    })
    .compileComponents();
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
