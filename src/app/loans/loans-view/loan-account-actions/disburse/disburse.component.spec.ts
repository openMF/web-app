import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { DisburseComponent } from './disburse.component';
import { ReactiveFormsModule } from '@angular/forms';
import { HttpClient, HttpClientModule } from '@angular/common/http';

describe('DisburseComponent', () => {
  let component: DisburseComponent;
  let fixture: ComponentFixture<DisburseComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [DisburseComponent],
      imports: [
        ReactiveFormsModule,
        HttpClientModule
      ]
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(DisburseComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
