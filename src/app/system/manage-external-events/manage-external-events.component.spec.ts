import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ManageExternalEventsComponent } from './manage-external-events.component';

describe('ManageExternalEventsComponent', () => {
  let component: ManageExternalEventsComponent;
  let fixture: ComponentFixture<ManageExternalEventsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ManageExternalEventsComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ManageExternalEventsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
