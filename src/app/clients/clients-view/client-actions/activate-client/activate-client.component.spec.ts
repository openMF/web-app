import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ActivateClientComponent } from './activate-client.component';

describe('ActivateClientComponent', () => {
  let component: ActivateClientComponent;
  let fixture: ComponentFixture<ActivateClientComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ActivateClientComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ActivateClientComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
