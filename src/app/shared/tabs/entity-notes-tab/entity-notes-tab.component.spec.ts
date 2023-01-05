import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EntityNotesTabComponent } from './entity-notes-tab.component';

describe('EntityNotesTabComponent', () => {
  let component: EntityNotesTabComponent;
  let fixture: ComponentFixture<EntityNotesTabComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ EntityNotesTabComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(EntityNotesTabComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
