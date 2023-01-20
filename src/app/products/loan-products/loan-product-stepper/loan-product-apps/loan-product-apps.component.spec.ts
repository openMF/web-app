import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LoanProductAppsComponent } from './loan-product-apps.component';

describe('LoanProductAppsComponent', () => {
  let component: LoanProductAppsComponent;
  let fixture: ComponentFixture<LoanProductAppsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ LoanProductAppsComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(LoanProductAppsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
