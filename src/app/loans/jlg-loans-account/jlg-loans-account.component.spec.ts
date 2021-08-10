import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { JlgLoansAccountComponent } from './jlg-loans-account.component';

describe('JlgLoansAccountComponent', () => {
  let component: JlgLoansAccountComponent;
  let fixture: ComponentFixture<JlgLoansAccountComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ JlgLoansAccountComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(JlgLoansAccountComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
