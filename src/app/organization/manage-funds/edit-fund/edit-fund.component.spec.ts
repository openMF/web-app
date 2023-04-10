import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EditFundComponent } from './edit-fund.component';

describe('EditFundComponent', () => {
  let component: EditFundComponent;
  let fixture: ComponentFixture<EditFundComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ EditFundComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(EditFundComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
