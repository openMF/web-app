import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { CreateSavingsAccountComponent } from './create-savings-account.component';

describe('CreateSavingsAccountComponent', () => {
  let component: CreateSavingsAccountComponent;
  let fixture: ComponentFixture<CreateSavingsAccountComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ CreateSavingsAccountComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CreateSavingsAccountComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
