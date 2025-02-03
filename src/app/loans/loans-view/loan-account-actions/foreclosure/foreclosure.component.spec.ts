import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ForeclosureComponent } from './foreclosure.component';
import { ReactiveFormsModule } from '@angular/forms';
import { RouterTestingModule } from '@angular/router/testing';

describe('ForeclosureComponent', () => {
  let component: ForeclosureComponent;
  let fixture: ComponentFixture<ForeclosureComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ForeclosureComponent],
      providers: [
        ReactiveFormsModule,
        RouterTestingModule
      ]
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ForeclosureComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
