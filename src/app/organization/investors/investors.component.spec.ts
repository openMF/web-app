import { ComponentFixture, TestBed } from '@angular/core/testing';

import { InvestorsComponent } from './investors.component';
import { CommonModule, DatePipe } from '@angular/common';
import { MatDialogModule } from '@angular/material/dialog';
import { HttpClientModule } from '@angular/common/http';

describe('InvestorsComponent', () => {
  let component: InvestorsComponent;
  let fixture: ComponentFixture<InvestorsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [InvestorsComponent],
      imports: [
        MatDialogModule,
        HttpClientModule,
        CommonModule
      ],
      providers: [DatePipe]
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(InvestorsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
