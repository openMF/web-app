import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { CreateLoansAccountComponent } from './create-loans-account.component';

describe('CreateLoansAccountComponent', () => {
  let component: CreateLoansAccountComponent;
  let fixture: ComponentFixture<CreateLoansAccountComponent>;

  beforeEach(async(() => {
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
