import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { EditDataTableComponent } from './edit-data-table.component';
import { HttpClientModule } from '@angular/common/http';

describe('EditDataTableComponent', () => {
  let component: EditDataTableComponent;
  let fixture: ComponentFixture<EditDataTableComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [EditDataTableComponent],
      imports: [HttpClientModule]
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
