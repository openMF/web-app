import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { CreateSavingsAccountComponent } from './create-savings-account.component';

describe('CreateSavingsAccountComponent', () => {
  let component: CreateSavingsAccountComponent;
  let fixture: ComponentFixture<CreateSavingsAccountComponent>;

  beforeEach(async(() => {
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
