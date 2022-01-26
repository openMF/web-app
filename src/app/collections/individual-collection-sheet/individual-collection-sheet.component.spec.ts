import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { IndividualCollectionSheetComponent } from './individual-collection-sheet.component';

describe('IndividualCollectionSheetComponent', () => {
  let component: IndividualCollectionSheetComponent;
  let fixture: ComponentFixture<IndividualCollectionSheetComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ IndividualCollectionSheetComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(IndividualCollectionSheetComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
