import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AdddetailTabComponent } from './adddetail.component';

describe('AdddetailTabComponent', () => {
  let component: AdddetailTabComponent;
  let fixture: ComponentFixture<AdddetailTabComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ AdddetailTabComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AdddetailTabComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
   expect(component).toBeTruthy();
  });
});
