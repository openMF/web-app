import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { EditAdhocQueryComponent } from './edit-adhoc-query.component';
import { ReactiveFormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';

describe('EditAdhocQueryComponent', () => {
  let component: EditAdhocQueryComponent;
  let fixture: ComponentFixture<EditAdhocQueryComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [EditAdhocQueryComponent],
      imports: [
        ReactiveFormsModule,
        HttpClientModule
      ]
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(EditAdhocQueryComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
