import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { DividendsTabComponent } from './dividends-tab.component';

describe('DividendsTabComponent', () => {
  let component: DividendsTabComponent;
  let fixture: ComponentFixture<DividendsTabComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ DividendsTabComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(DividendsTabComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
