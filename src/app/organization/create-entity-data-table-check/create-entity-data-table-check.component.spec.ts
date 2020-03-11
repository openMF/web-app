import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { CreateEntityDataTableCheckComponent } from './create-entity-data-table-check.component';

describe('CreateEntityDataTableCheckComponent', () => {
  let component: CreateEntityDataTableCheckComponent;
  let fixture: ComponentFixture<CreateEntityDataTableCheckComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ CreateEntityDataTableCheckComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CreateEntityDataTableCheckComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
