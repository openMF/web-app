import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { CreateGroupComponent } from './create-group.component';
import { ReactiveFormsModule } from '@angular/forms';
import { RouterTestingModule } from '@angular/router/testing';
import { HttpClientModule } from '@angular/common/http';

describe('CreateGroupComponent', () => {
  let component: CreateGroupComponent;
  let fixture: ComponentFixture<CreateGroupComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [CreateGroupComponent],
      imports: [
        ReactiveFormsModule,
        RouterTestingModule,
        HttpClientModule
      ]
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CreateGroupComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
