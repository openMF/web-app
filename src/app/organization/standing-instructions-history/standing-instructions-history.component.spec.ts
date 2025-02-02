import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { StandingInstructionsHistoryComponent } from './standing-instructions-history.component';
import { ReactiveFormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';
import { DatePipe } from '@angular/common';

describe('StandingInstructionsHistoryComponent', () => {
  let component: StandingInstructionsHistoryComponent;
  let fixture: ComponentFixture<StandingInstructionsHistoryComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [StandingInstructionsHistoryComponent],
      imports: [
        ReactiveFormsModule,
        HttpClientModule
      ],
      providers: [DatePipe]
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(StandingInstructionsHistoryComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
