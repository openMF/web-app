import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { EntityToEntityMappingComponent } from './entity-to-entity-mapping.component';

describe('EntityToEntityMappingComponent', () => {
  let component: EntityToEntityMappingComponent;
  let fixture: ComponentFixture<EntityToEntityMappingComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ EntityToEntityMappingComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(EntityToEntityMappingComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
