import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { DisableDialogComponent } from './disable-dialog.component';

describe('DisableDialogComponent', () => {
  let component: DisableDialogComponent;
  let fixture: ComponentFixture<DisableDialogComponent>;

  beforeEach(async(() => {
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
