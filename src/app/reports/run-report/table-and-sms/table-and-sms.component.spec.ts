import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { TableAndSmsComponent } from './table-and-sms.component';

describe('TableAndSmsComponent', () => {
  let component: TableAndSmsComponent;
  let fixture: ComponentFixture<TableAndSmsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ TableAndSmsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(TableAndSmsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
