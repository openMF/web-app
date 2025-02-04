import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { CreateCodeComponent } from './create-code.component';
import { ReactiveFormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';

describe('CreateCodeComponent', () => {
  let component: CreateCodeComponent;
  let fixture: ComponentFixture<CreateCodeComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [CreateCodeComponent],
      imports: [
        ReactiveFormsModule,
        HttpClientModule
      ]
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CreateCodeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
