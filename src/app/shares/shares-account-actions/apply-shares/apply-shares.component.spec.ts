import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { ApplySharesComponent } from './apply-shares.component';

describe('ApplySharesComponent', () => {
  let component: ApplySharesComponent;
  let fixture: ComponentFixture<ApplySharesComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ ApplySharesComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ApplySharesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
