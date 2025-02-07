import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { MigrateOpeningBalancesComponent } from './migrate-opening-balances.component';
import { ReactiveFormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { RouterTestingModule } from '@angular/router/testing';
import { DatePipe } from '@angular/common';
import { OverlayModule } from '@angular/cdk/overlay';

describe('MigrateOpeningBalancesComponent', () => {
  let component: MigrateOpeningBalancesComponent;
  let fixture: ComponentFixture<MigrateOpeningBalancesComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [MigrateOpeningBalancesComponent],
      imports: [
        ReactiveFormsModule,
        HttpClientModule,
        RouterTestingModule,
        CommonModule,
        OverlayModule
      ],
      providers: [
        DatePipe
      ]
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(MigrateOpeningBalancesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
