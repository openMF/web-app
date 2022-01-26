import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { SingleRowComponent } from './single-row.component';

describe('SingleRowComponent', () => {
  let component: SingleRowComponent;
  let fixture: ComponentFixture<SingleRowComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ SingleRowComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SingleRowComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
