import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AllocateCashComponent } from './allocate-cash.component';

describe('AllocateCashComponent', () => {
  let component: AllocateCashComponent;
  let fixture: ComponentFixture<AllocateCashComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ AllocateCashComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AllocateCashComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
