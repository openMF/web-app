import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { EditEmailComponent } from './edit-email.component';

describe('EditEmailComponent', () => {
  let component: EditEmailComponent;
  let fixture: ComponentFixture<EditEmailComponent>;

  beforeEach(async(() => {
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
