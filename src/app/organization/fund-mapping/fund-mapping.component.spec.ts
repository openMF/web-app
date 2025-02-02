import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { FundMappingComponent } from './fund-mapping.component';
import { ReactiveFormsModule } from '@angular/forms';

describe('FundMappingComponent', () => {
  let component: FundMappingComponent;
  let fixture: ComponentFixture<FundMappingComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [FundMappingComponent],
      imports: [ReactiveFormsModule]
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(FundMappingComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
