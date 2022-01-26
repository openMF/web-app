import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { WithdrawnByClientComponent } from './withdrawn-by-client.component';

describe('WithdrawnByClientComponent', () => {
  let component: WithdrawnByClientComponent;
  let fixture: ComponentFixture<WithdrawnByClientComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ WithdrawnByClientComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(WithdrawnByClientComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
