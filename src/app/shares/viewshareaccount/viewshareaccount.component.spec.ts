import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ViewshareaccountComponent } from './viewshareaccount.component';

describe('ViewshareaccountComponent', () => {
  let component: ViewshareaccountComponent;
  let fixture: ComponentFixture<ViewshareaccountComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ViewshareaccountComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ViewshareaccountComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
