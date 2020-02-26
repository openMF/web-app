import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { NotariosTabComponent } from './notarios-tab.component';

describe('NotariosTabComponent', () => {
  let component: NotariosTabComponent;
  let fixture: ComponentFixture<NotariosTabComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ NotariosTabComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(NotariosTabComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
