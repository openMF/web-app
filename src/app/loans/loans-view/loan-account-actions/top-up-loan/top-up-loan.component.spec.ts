import { waitForAsync, ComponentFixture, TestBed } from "@angular/core/testing";

import { TopUpLoanComponent } from "./top-up-loan.component";

describe("TopUpLoanComponent", () => {
  let component: TopUpLoanComponent;
  let fixture: ComponentFixture<TopUpLoanComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [TopUpLoanComponent],
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(TopUpLoanComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it("should create", () => {
    expect(component).toBeTruthy();
  });
});
