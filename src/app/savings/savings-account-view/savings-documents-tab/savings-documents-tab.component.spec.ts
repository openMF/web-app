import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SavingsDocumentsTabComponent } from './savings-documents-tab.component';

describe('SavingsDocumentsTabComponent', () => {
  let component: SavingsDocumentsTabComponent;
  let fixture: ComponentFixture<SavingsDocumentsTabComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ SavingsDocumentsTabComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(SavingsDocumentsTabComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
