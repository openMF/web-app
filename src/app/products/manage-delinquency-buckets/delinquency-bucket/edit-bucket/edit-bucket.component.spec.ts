import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EditBucketComponent } from './edit-bucket.component';

describe('EditBucketComponent', () => {
  let component: EditBucketComponent;
  let fixture: ComponentFixture<EditBucketComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ EditBucketComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(EditBucketComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
