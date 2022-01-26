import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { DocumentsTabComponent } from './documents-tab.component';

describe('DocumentsTabComponent', () => {
  let component: DocumentsTabComponent;
  let fixture: ComponentFixture<DocumentsTabComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ DocumentsTabComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(DocumentsTabComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
