import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ChargesTabComponent } from './charges-tab.component';
import { HttpClientModule } from '@angular/common/http';
import { RouterTestingModule } from '@angular/router/testing';
import { DatePipe } from '@angular/common';

describe('ChargesTabComponent', () => {
  let component: ChargesTabComponent;
  let fixture: ComponentFixture<ChargesTabComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ChargesTabComponent],
      imports: [
        HttpClientModule,
        RouterTestingModule
      ],
      providers: [
        DatePipe
      ]
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ChargesTabComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
