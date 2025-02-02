import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { CreateGlAccountComponent } from './create-gl-account.component';
import { ReactiveFormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';
import { RouterTestingModule } from '@angular/router/testing';

describe('CreateGlAccountComponent', () => {
  let component: CreateGlAccountComponent;
  let fixture: ComponentFixture<CreateGlAccountComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [CreateGlAccountComponent],
      imports: [
        ReactiveFormsModule,
        HttpClientModule,
        RouterTestingModule
      ]
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CreateGlAccountComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
