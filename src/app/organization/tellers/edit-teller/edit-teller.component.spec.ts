import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { EditTellerComponent } from './edit-teller.component';
import { ReactiveFormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';

describe('EditTellerComponent', () => {
  let component: EditTellerComponent;
  let fixture: ComponentFixture<EditTellerComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [EditTellerComponent],
      imports: [
        ReactiveFormsModule,
        HttpClientModule
      ]
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(EditTellerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
