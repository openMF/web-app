import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { PentahoComponent } from './pentaho.component';

describe('PentahoComponent', () => {
  let component: PentahoComponent;
  let fixture: ComponentFixture<PentahoComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ PentahoComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PentahoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
