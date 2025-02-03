import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DatatableTabComponent } from './datatable-tab.component';
import { RouterTestingModule } from '@angular/router/testing';

describe('DatatableTabComponent', () => {
  let component: DatatableTabComponent;
  let fixture: ComponentFixture<DatatableTabComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [DatatableTabComponent],
      imports: [RouterTestingModule]
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(DatatableTabComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
