import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { EditEmailComponent } from './edit-email.component';

describe('EditEmailComponent', () => {
  let component: EditEmailComponent;
  let fixture: ComponentFixture<EditEmailComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ EditEmailComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(EditEmailComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
