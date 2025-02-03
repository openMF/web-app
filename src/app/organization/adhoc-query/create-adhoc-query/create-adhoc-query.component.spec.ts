import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { CreateAdhocQueryComponent } from './create-adhoc-query.component';
import { ReactiveFormsModule } from '@angular/forms';

describe('CreateAdhocQueryComponent', () => {
  let component: CreateAdhocQueryComponent;
  let fixture: ComponentFixture<CreateAdhocQueryComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [CreateAdhocQueryComponent],
      imports: [ReactiveFormsModule]
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CreateAdhocQueryComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
