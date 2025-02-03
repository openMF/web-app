import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { IndividualCollectionSheetComponent } from './individual-collection-sheet.component';
import { ReactiveFormsModule } from '@angular/forms';

describe('IndividualCollectionSheetComponent', () => {
  let component: IndividualCollectionSheetComponent;
  let fixture: ComponentFixture<IndividualCollectionSheetComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [IndividualCollectionSheetComponent],
      imports: [ReactiveFormsModule]
    }).compileComponents();
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
