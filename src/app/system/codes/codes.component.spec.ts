import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { CodesComponent } from './codes.component';
import { ReactiveFormsModule } from '@angular/forms';

describe('CodesComponent', () => {
  let component: CodesComponent;
  let fixture: ComponentFixture<CodesComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [CodesComponent],
      imports: [ReactiveFormsModule]
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CodesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
