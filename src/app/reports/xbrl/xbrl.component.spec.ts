import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { XBRLComponent } from './xbrl.component';

describe('XBRLComponent', () => {
  let component: XBRLComponent;
  let fixture: ComponentFixture<XBRLComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ XBRLComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(XBRLComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
