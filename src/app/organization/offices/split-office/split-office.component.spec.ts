import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SplitOfficeComponent } from './split-office.component';

describe('SplitOfficeComponent', () => {
  let component: SplitOfficeComponent;
  let fixture: ComponentFixture<SplitOfficeComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ SplitOfficeComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(SplitOfficeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
