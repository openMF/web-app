import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { ClientActionsComponent } from './client-actions.component';

describe('ClientActionsComponent', () => {
  let component: ClientActionsComponent;
  let fixture: ComponentFixture<ClientActionsComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ ClientActionsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ClientActionsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
