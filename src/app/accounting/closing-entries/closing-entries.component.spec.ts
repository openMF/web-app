import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ClosingEntriesComponent } from './closing-entries.component';
import { RouterTestingModule } from '@angular/router/testing';

describe('ClosingEntriesComponent', () => {
  let component: ClosingEntriesComponent;
  let fixture: ComponentFixture<ClosingEntriesComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ClosingEntriesComponent],
      imports: [RouterTestingModule]
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ClosingEntriesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
