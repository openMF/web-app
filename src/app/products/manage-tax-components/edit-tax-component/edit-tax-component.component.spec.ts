import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { EditTaxComponentComponent } from './edit-tax-component.component';
import { ReactiveFormsModule } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { HttpClientModule } from '@angular/common/http';
import { CommonModule, DatePipe } from '@angular/common';

describe('EditTaxComponentComponent', () => {
  let component: EditTaxComponentComponent;
  let fixture: ComponentFixture<EditTaxComponentComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [EditTaxComponentComponent],
      imports: [
        ReactiveFormsModule,
        TranslateModule,
        HttpClientModule,
        CommonModule
      ],
      providers: [DatePipe]
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(EditTaxComponentComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
