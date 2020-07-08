import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { CloseGroupComponent } from './close-group.component';

describe('CloseGroupComponent', () => {
  let component: CloseGroupComponent;
  let fixture: ComponentFixture<CloseGroupComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ CloseGroupComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CloseGroupComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
