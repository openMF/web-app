import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AdhocQueryComponent } from './adhoc-query.component';

describe('AdhocQueryComponent', () => {
  let component: AdhocQueryComponent;
  let fixture: ComponentFixture<AdhocQueryComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ AdhocQueryComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AdhocQueryComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
