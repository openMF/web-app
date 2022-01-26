import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { CreateLoansAccountComponent } from './create-loans-account.component';

describe('CreateLoansAccountComponent', () => {
  let component: CreateLoansAccountComponent;
  let fixture: ComponentFixture<CreateLoansAccountComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ CreateLoansAccountComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CreateLoansAccountComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
