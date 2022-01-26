import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { CreateEnityDataTableChecksComponent } from './create-enity-data-table-checks.component';

describe('CreateEnityDataTableChecksComponent', () => {
  let component: CreateEnityDataTableChecksComponent;
  let fixture: ComponentFixture<CreateEnityDataTableChecksComponent>;

  beforeEach(waitForAsync(() => {
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
