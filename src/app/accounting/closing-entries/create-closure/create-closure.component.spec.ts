import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { CreateClosureComponent } from './create-closure.component';
import { ReactiveFormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { TranslateModule, TranslateService } from '@ngx-translate/core';

describe('CreateClosureComponent', () => {
  let component: CreateClosureComponent;
  let fixture: ComponentFixture<CreateClosureComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [CreateClosureComponent],
      imports: [
        ReactiveFormsModule,
        HttpClientModule,
        TranslateModule,
        CommonModule
      ],
      providers: [
        TranslateService
      ]
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CreateClosureComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
