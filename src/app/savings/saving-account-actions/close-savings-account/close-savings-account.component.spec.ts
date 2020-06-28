import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { CloseSavingsAccountComponent } from './close-savings-account.component';

describe('CloseSavingsAccountComponent', () => {
  let component: CloseSavingsAccountComponent;
  let fixture: ComponentFixture<CloseSavingsAccountComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ CloseSavingsAccountComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CloseSavingsAccountComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
