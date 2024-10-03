import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ReschedulePreviewComponent } from './reschedule-preview.component';

describe('ReschedulePreviewComponent', () => {
  let component: ReschedulePreviewComponent;
  let fixture: ComponentFixture<ReschedulePreviewComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ReschedulePreviewComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ReschedulePreviewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
