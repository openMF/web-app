import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CountryTreeViewComponent } from './country-tree-view.component';

describe('CountryTreeViewComponent', () => {
  let component: CountryTreeViewComponent;
  let fixture: ComponentFixture<CountryTreeViewComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ CountryTreeViewComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(CountryTreeViewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
