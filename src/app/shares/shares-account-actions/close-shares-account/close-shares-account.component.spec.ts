import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { CloseSharesAccountComponent } from './close-shares-account.component';

describe('CloseSharesAccountComponent', () => {
  let component: CloseSharesAccountComponent;
  let fixture: ComponentFixture<CloseSharesAccountComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ CloseSharesAccountComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CloseSharesAccountComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
