import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { RecurringDepositsAccountViewComponent } from './recurring-deposits-account-view.component';
import { RouterTestingModule } from '@angular/router/testing';
import { HttpClientModule } from '@angular/common/http';

describe('RecurringDepositsAccountViewComponent', () => {
  let component: RecurringDepositsAccountViewComponent;
  let fixture: ComponentFixture<RecurringDepositsAccountViewComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [RecurringDepositsAccountViewComponent],
      imports: [
        RouterTestingModule,
        HttpClientModule
      ]
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(RecurringDepositsAccountViewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
