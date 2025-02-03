import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { CreateTellerComponent } from './create-teller.component';
import { HttpClientModule } from '@angular/common/http';
import { ReactiveFormsModule } from '@angular/forms';
import { CommonModule, DatePipe } from '@angular/common';

describe('CreateTellerComponent', () => {
  let component: CreateTellerComponent;
  let fixture: ComponentFixture<CreateTellerComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [CreateTellerComponent],
      imports: [
        HttpClientModule,
        ReactiveFormsModule,
        CommonModule
      ],
      providers: [DatePipe]
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CreateTellerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
