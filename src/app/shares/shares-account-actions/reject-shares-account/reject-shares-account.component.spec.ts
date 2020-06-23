import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { RejectSharesAccountComponent } from './reject-shares-account.component';

describe('RejectSharesAccountComponent', () => {
  let component: RejectSharesAccountComponent;
  let fixture: ComponentFixture<RejectSharesAccountComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ RejectSharesAccountComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(RejectSharesAccountComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
