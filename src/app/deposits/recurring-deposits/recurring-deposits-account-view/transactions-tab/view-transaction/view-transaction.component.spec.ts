import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ViewTransactionComponent } from './view-transaction.component';
import { HttpClientModule } from '@angular/common/http';
import { RouterTestingModule } from '@angular/router/testing';

describe('ViewTransactionComponent', () => {
  let component: ViewTransactionComponent;
  let fixture: ComponentFixture<ViewTransactionComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ViewTransactionComponent],
      imports: [
        HttpClientModule,
        RouterTestingModule
      ]
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ViewTransactionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
