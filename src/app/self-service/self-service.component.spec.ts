import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { SelfServiceComponent } from './self-service.component';

describe('SelfServiceComponent', () => {
  let component: SelfServiceComponent;
  let fixture: ComponentFixture<SelfServiceComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ SelfServiceComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SelfServiceComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
