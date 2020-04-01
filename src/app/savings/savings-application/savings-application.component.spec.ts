import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SavingsApplicationComponent } from './savings-application.component';

describe('SavingsApplicationComponent', () => {
  let component: SavingsApplicationComponent;
  let fixture: ComponentFixture<SavingsApplicationComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SavingsApplicationComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SavingsApplicationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
