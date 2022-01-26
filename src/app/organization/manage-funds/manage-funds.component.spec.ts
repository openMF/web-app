import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { ManageFundsComponent } from './manage-funds.component';

describe('ManageFundsComponent', () => {
  let component: ManageFundsComponent;
  let fixture: ComponentFixture<ManageFundsComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ ManageFundsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ManageFundsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
