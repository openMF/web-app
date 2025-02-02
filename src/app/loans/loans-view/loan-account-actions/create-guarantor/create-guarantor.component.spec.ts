import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { CreateGuarantorComponent } from './create-guarantor.component';
import { ReactiveFormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';

describe('CreateGuarantorComponent', () => {
  let component: CreateGuarantorComponent;
  let fixture: ComponentFixture<CreateGuarantorComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [CreateGuarantorComponent],
      imports: [
        ReactiveFormsModule,
        HttpClientModule
      ]
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CreateGuarantorComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
