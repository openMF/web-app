import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { WithdrawnByClientComponent } from './withdrawn-by-client.component';

describe('WithdrawnByClientComponent', () => {
  let component: WithdrawnByClientComponent;
  let fixture: ComponentFixture<WithdrawnByClientComponent>;

  beforeEach(async(() => {
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
