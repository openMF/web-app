import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ViewGuarantorsComponent } from './view-guarantors.component';
import { MatDialogModule } from '@angular/material/dialog';
import { HttpClientModule } from '@angular/common/http';
import { DatePipe } from '@angular/common';

describe('ViewGuarantorsComponent', () => {
  let component: ViewGuarantorsComponent;
  let fixture: ComponentFixture<ViewGuarantorsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ViewGuarantorsComponent],
      imports: [
        MatDialogModule,
        HttpClientModule
      ],
      providers: [
        DatePipe
      ]
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ViewGuarantorsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
