import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { CreateFinancialActivityMappingComponent } from './create-financial-activity-mapping.component';
import { ReactiveFormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';

describe('CreateFinancialActivityMappingComponent', () => {
  let component: CreateFinancialActivityMappingComponent;
  let fixture: ComponentFixture<CreateFinancialActivityMappingComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [CreateFinancialActivityMappingComponent],
      imports: [
        ReactiveFormsModule,
        HttpClientModule
      ]
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CreateFinancialActivityMappingComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
