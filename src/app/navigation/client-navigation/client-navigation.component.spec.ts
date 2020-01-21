import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ClientNavigationComponent } from './client-navigation.component';

describe('ClientNavigationComponent', () => {
  let component: ClientNavigationComponent;
  let fixture: ComponentFixture<ClientNavigationComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ClientNavigationComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ClientNavigationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
