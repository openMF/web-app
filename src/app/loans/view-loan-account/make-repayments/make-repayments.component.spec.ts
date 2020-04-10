import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { MakeRepaymentsComponent } from './make-repayments.component';

describe('MakeRepaymentsComponent', () => {
  let component: MakeRepaymentsComponent;
  let fixture: ComponentFixture<MakeRepaymentsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ MakeRepaymentsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(MakeRepaymentsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
