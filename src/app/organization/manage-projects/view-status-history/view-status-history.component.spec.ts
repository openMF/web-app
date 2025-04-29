import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ViewStatusHistoryComponent } from './view-status-history.component';

describe('ViewStatusHistoryComponent', () => {
  let component: ViewStatusHistoryComponent;
  let fixture: ComponentFixture<ViewStatusHistoryComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ViewStatusHistoryComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ViewStatusHistoryComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
