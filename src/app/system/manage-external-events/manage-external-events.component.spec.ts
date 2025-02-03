import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ManageExternalEventsComponent } from './manage-external-events.component';
import { RouterTestingModule } from '@angular/router/testing';
import { HttpClient } from '@angular/common/http';

describe('ManageExternalEventsComponent', () => {
  let component: ManageExternalEventsComponent;
  let fixture: ComponentFixture<ManageExternalEventsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ManageExternalEventsComponent],
      imports: [
        RouterTestingModule,
        HttpClient
      ]
    }).compileComponents();
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
