import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { ActivateClientComponent } from './activate-client.component';

describe('ActivateClientComponent', () => {
  let component: ActivateClientComponent;
  let fixture: ComponentFixture<ActivateClientComponent>;

  beforeEach(waitForAsync(() => {
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
