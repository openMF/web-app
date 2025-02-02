import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { CloseCenterComponent } from './close-center.component';
import { ReactiveFormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';

describe('CloseCenterComponent', () => {
  let component: CloseCenterComponent;
  let fixture: ComponentFixture<CloseCenterComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [CloseCenterComponent],
      imports: [
        ReactiveFormsModule,
        HttpClientModule
      ]
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CloseCenterComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
