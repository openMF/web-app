import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { EditAmazonS3Component } from './edit-amazon-s3.component';

describe('EditAmazonS3Component', () => {
  let component: EditAmazonS3Component;
  let fixture: ComponentFixture<EditAmazonS3Component>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ EditAmazonS3Component ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(EditAmazonS3Component);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
