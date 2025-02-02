import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { EditDataTableComponent } from './edit-data-table.component';
import { HttpClientModule } from '@angular/common/http';
import { ReactiveFormsModule } from '@angular/forms';

describe('EditDataTableComponent', () => {
  let component: EditDataTableComponent;
  let fixture: ComponentFixture<EditDataTableComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [EditDataTableComponent],
      imports: [
        HttpClientModule,
        ReactiveFormsModule
      ]
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(EditDataTableComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
