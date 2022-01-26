import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { ServerSelectorComponent } from './server-selector.component';

describe('ServerSelectorComponent', () => {
  let component: ServerSelectorComponent;
  let fixture: ComponentFixture<ServerSelectorComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ ServerSelectorComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ServerSelectorComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
