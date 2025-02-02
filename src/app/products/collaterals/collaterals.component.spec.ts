import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CollateralsComponent } from './collaterals.component';
import { HttpClientModule } from '@angular/common/http';
import { ReactiveFormsModule } from '@angular/forms';

describe('CollateralsComponent', () => {
  let component: CollateralsComponent;
  let fixture: ComponentFixture<CollateralsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [CollateralsComponent],
      imports: [
        ReactiveFormsModule,
        HttpClientModule
      ]
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(CollateralsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
