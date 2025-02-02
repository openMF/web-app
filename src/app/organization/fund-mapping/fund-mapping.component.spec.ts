import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { FundMappingComponent } from './fund-mapping.component';
import { ReactiveFormsModule } from '@angular/forms';
import { RouterTestingModule } from '@angular/router/testing';
import { HttpClientModule } from '@angular/common/http';

describe('FundMappingComponent', () => {
  let component: FundMappingComponent;
  let fixture: ComponentFixture<FundMappingComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [FundMappingComponent],
      imports: [
        ReactiveFormsModule,
        RouterTestingModule,
        HttpClientModule
      ]
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
