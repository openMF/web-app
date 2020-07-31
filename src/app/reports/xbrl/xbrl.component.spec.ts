import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { XBRLComponent } from './xbrl.component';

describe('XBRLComponent', () => {
  let component: XBRLComponent;
  let fixture: ComponentFixture<XBRLComponent>;

  beforeEach(async(() => {
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
