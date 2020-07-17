import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SettleCashComponent } from './settle-cash.component';

describe('SettleCashComponent', () => {
  let component: SettleCashComponent;
  let fixture: ComponentFixture<SettleCashComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SettleCashComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SettleCashComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
