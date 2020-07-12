import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { EditAdhocQueryComponent } from './edit-adhoc-query.component';

describe('EditAdhocQueryComponent', () => {
  let component: EditAdhocQueryComponent;
  let fixture: ComponentFixture<EditAdhocQueryComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ EditAdhocQueryComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(EditAdhocQueryComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
