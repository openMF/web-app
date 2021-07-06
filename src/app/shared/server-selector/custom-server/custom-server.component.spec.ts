import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { CustomServerComponent } from './custom-server.component';

describe('CustomServerComponent', () => {
  let component: CustomServerComponent;
  let fixture: ComponentFixture<CustomServerComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ CustomServerComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CustomServerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

