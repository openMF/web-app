import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ViewBucketComponent } from './view-bucket.component';

describe('ViewBucketComponent', () => {
  let component: ViewBucketComponent;
  let fixture: ComponentFixture<ViewBucketComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ViewBucketComponent ]
    })
    .compileComponents();
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
