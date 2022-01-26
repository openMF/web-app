import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { DisableDialogComponent } from './disable-dialog.component';

describe('DisableDialogComponent', () => {
  let component: DisableDialogComponent;
  let fixture: ComponentFixture<DisableDialogComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ DisableDialogComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(DisableDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
