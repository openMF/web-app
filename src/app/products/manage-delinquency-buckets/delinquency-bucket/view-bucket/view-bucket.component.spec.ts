import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ViewBucketComponent } from './view-bucket.component';
import { RouterTestingModule } from '@angular/router/testing';

describe('ViewBucketComponent', () => {
  let component: ViewBucketComponent;
  let fixture: ComponentFixture<ViewBucketComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ViewBucketComponent],
      imports: [RouterTestingModule]
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ViewBucketComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
