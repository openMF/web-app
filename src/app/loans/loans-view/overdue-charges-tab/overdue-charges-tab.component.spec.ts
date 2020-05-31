import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { OverdueChargesTabComponent } from './overdue-charges-tab.component';

describe('OverdueChargesTabComponent', () => {
  let component: OverdueChargesTabComponent;
  let fixture: ComponentFixture<OverdueChargesTabComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ OverdueChargesTabComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(OverdueChargesTabComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
