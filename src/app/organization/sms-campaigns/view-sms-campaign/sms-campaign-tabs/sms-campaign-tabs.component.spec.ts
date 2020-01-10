import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { PendingSmsTabComponent } from './pending-sms-tab.component';

describe('PendingSmsTabComponent', () => {
  let component: PendingSmsTabComponent;
  let fixture: ComponentFixture<PendingSmsTabComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ PendingSmsTabComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PendingSmsTabComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
