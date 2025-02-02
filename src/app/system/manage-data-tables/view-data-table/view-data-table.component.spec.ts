import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ViewDataTableComponent } from './view-data-table.component';
import { RouterTestingModule } from '@angular/router/testing';

describe('ViewDataTableComponent', () => {
  let component: ViewDataTableComponent;
  let fixture: ComponentFixture<ViewDataTableComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ViewDataTableComponent],
      imports: [RouterTestingModule]
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ViewDataTableComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
