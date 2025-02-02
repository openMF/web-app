import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ViewTellerComponent } from './view-teller.component';
import { HttpClientModule } from '@angular/common/http';

describe('ViewTellerComponent', () => {
  let component: ViewTellerComponent;
  let fixture: ComponentFixture<ViewTellerComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ViewTellerComponent],
      imports: [HttpClientModule]
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ViewTellerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
