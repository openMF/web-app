import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { MultiRowComponent } from './multi-row.component';

describe('MultiRowComponent', () => {
  let component: MultiRowComponent;
  let fixture: ComponentFixture<MultiRowComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ MultiRowComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(MultiRowComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
