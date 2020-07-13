import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { CloseClientComponent } from './close-client.component';

describe('CloseClientComponent', () => {
  let component: CloseClientComponent;
  let fixture: ComponentFixture<CloseClientComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ CloseClientComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CloseClientComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
