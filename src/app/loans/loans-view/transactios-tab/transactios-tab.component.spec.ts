import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { TransactiosTabComponent } from './transactios-tab.component';

describe('TransactiosTabComponent', () => {
  let component: TransactiosTabComponent;
  let fixture: ComponentFixture<TransactiosTabComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ TransactiosTabComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(TransactiosTabComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
