import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { CreateAdhocQueryComponent } from './create-adhoc-query.component';

describe('CreateAdhocQueryComponent', () => {
  let component: CreateAdhocQueryComponent;
  let fixture: ComponentFixture<CreateAdhocQueryComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ CreateAdhocQueryComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CreateAdhocQueryComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
