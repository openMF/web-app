import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RuralOutletComponent } from './rural-outlet.component';

describe('RuralOutletComponent', () => {
  let component: RuralOutletComponent;
  let fixture: ComponentFixture<RuralOutletComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ RuralOutletComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(RuralOutletComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
