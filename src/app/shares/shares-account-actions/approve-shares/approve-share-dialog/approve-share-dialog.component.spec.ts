import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ApproveShareDialogComponent } from './approve-share-dialog.component';

describe('ApproveShareDialogComponent', () => {
  let component: ApproveShareDialogComponent;
  let fixture: ComponentFixture<ApproveShareDialogComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ApproveShareDialogComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ApproveShareDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
