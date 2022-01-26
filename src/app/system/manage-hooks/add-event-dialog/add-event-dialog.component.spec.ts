import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { AddEventDialogComponent } from './add-event-dialog.component';

describe('AddEventDialogComponent', () => {
  let component: AddEventDialogComponent;
  let fixture: ComponentFixture<AddEventDialogComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ AddEventDialogComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AddEventDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
