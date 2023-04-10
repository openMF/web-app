import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CreateFundComponent } from './create-fund.component';

describe('CreateFundComponent', () => {
  let component: CreateFundComponent;
  let fixture: ComponentFixture<CreateFundComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ CreateFundComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(CreateFundComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
