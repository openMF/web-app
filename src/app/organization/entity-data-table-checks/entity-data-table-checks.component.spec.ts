import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { EntityDataTableChecksComponent } from './entity-data-table-checks.component';

describe('EntityDataTableChecksComponent', () => {
  let component: EntityDataTableChecksComponent;
  let fixture: ComponentFixture<EntityDataTableChecksComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ EntityDataTableChecksComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(EntityDataTableChecksComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
