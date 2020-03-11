import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { CollectionSheetComponent } from './collection-sheet.component';

describe('CollectionSheetComponent', () => {
  let component: CollectionSheetComponent;
  let fixture: ComponentFixture<CollectionSheetComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ CollectionSheetComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CollectionSheetComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
