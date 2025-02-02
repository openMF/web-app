import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { DividendsTabComponent } from './dividends-tab.component';
import { RouterTestingModule } from '@angular/router/testing';

describe('DividendsTabComponent', () => {
  let component: DividendsTabComponent;
  let fixture: ComponentFixture<DividendsTabComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [DividendsTabComponent],
      imports: [RouterTestingModule]
    }).compileComponents();
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
