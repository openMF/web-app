import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { ViewLoanComponent } from './view-loan.component';

describe('ViewLoanComponent', () => {
  let component: ViewLoanComponent;
  let fixture: ComponentFixture<ViewLoanComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ViewLoanComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ViewLoanComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
