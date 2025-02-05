import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ReactivateClientComponent } from './reactivate-client.component';
import { ReactiveFormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { DatePipe } from '@angular/common';

describe('ReactivateClientComponent', () => {
  let component: ReactivateClientComponent;
  let fixture: ComponentFixture<ReactivateClientComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ReactivateClientComponent],
      imports: [
        ReactiveFormsModule,
        HttpClientModule,
        CommonModule
      ],
      providers: [DatePipe]
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ReactivateClientComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
