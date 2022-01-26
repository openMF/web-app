import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { CreateSharesAccountComponent } from './create-shares-account.component';

describe('CreateSharesAccountComponent', () => {
  let component: CreateSharesAccountComponent;
  let fixture: ComponentFixture<CreateSharesAccountComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ CreateSharesAccountComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CreateSharesAccountComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
