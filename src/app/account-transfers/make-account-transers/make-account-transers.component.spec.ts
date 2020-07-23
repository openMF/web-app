import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { MakeAccountTransersComponent } from './make-account-transers.component';

describe('MakeAccountTransersComponent', () => {
  let component: MakeAccountTransersComponent;
  let fixture: ComponentFixture<MakeAccountTransersComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ MakeAccountTransersComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(MakeAccountTransersComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
