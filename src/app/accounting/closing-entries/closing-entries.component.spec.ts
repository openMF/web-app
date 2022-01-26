import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { ClosingEntriesComponent } from './closing-entries.component';

describe('ClosingEntriesComponent', () => {
  let component: ClosingEntriesComponent;
  let fixture: ComponentFixture<ClosingEntriesComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ ClosingEntriesComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ClosingEntriesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
