import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { EditShareProductComponent } from './edit-share-product.component';
import { RouterTestingModule } from '@angular/router/testing';
import { HttpClientModule } from '@angular/common/http';
import { DatePipe } from '@angular/common';

describe('EditShareProductComponent', () => {
  let component: EditShareProductComponent;
  let fixture: ComponentFixture<EditShareProductComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [EditShareProductComponent],
      imports: [
        RouterTestingModule,
        HttpClientModule
      ],
      providers: [DatePipe]
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(EditShareProductComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
