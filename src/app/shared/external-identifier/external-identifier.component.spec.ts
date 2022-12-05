import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ExternalIdentifierComponent } from './external-identifier.component';

describe('ExternalIdentifierComponent', () => {
  let component: ExternalIdentifierComponent;
  let fixture: ComponentFixture<ExternalIdentifierComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ExternalIdentifierComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ExternalIdentifierComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
