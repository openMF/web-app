import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { DatatableTabsComponent } from './datatable-tabs.component';
import { RouterTestingModule } from '@angular/router/testing';

describe('DatatableTabsComponent', () => {
  let component: DatatableTabsComponent;
  let fixture: ComponentFixture<DatatableTabsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [DatatableTabsComponent],
      imports: [RouterTestingModule]
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(DatatableTabsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
