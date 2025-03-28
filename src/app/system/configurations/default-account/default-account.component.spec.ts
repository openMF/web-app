import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DefaultAccountComponent } from './default-account.component';

describe('DefaultAccountComponent', () => {
  let component: DefaultAccountComponent;
  let fixture: ComponentFixture<DefaultAccountComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [DefaultAccountComponent]
    }).compileComponents();

    fixture = TestBed.createComponent(DefaultAccountComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
