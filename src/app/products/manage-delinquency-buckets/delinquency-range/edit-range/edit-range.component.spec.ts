import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EditRangeComponent } from './edit-range.component';

describe('EditRangeComponent', () => {
  let component: EditRangeComponent;
  let fixture: ComponentFixture<EditRangeComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ EditRangeComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(EditRangeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
