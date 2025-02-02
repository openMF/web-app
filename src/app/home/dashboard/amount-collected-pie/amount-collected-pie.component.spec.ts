import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AmountCollectedPieComponent } from './amount-collected-pie.component';
import { HttpClientModule } from '@angular/common/http';

describe('AmountCollectedPieComponent', () => {
  let component: AmountCollectedPieComponent;
  let fixture: ComponentFixture<AmountCollectedPieComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [AmountCollectedPieComponent],
      imports: [HttpClientModule]
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AmountCollectedPieComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
