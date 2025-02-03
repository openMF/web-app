import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { RejectSharesComponent } from './reject-shares.component';
import { HttpClientModule } from '@angular/common/http';
import { RouterTestingModule } from '@angular/router/testing';
import { MatDialogModule, MatDialogRef } from '@angular/material/dialog';

describe('RejectSharesComponent', () => {
  let component: RejectSharesComponent;
  let fixture: ComponentFixture<RejectSharesComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [RejectSharesComponent],
      imports: [
        HttpClientModule,
        RouterTestingModule,
        MatDialogModule
      ],
      providers: [MatDialogRef]
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(RejectSharesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
