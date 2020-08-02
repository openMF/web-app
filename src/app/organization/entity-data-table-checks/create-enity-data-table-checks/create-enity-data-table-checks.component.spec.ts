import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { CreateEnityDataTableChecksComponent } from './create-enity-data-table-checks.component';

describe('CreateEnityDataTableChecksComponent', () => {
  let component: CreateEnityDataTableChecksComponent;
  let fixture: ComponentFixture<CreateEnityDataTableChecksComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ CreateEnityDataTableChecksComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CreateEnityDataTableChecksComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
