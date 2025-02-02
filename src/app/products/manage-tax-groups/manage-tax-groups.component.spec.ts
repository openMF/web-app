import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ManageTaxGroupsComponent } from './manage-tax-groups.component';
import { ActivatedRoute } from '@angular/router';
import { of } from 'rxjs';

describe('ManageTaxGroupsComponent', () => {
  let component: ManageTaxGroupsComponent;
  let fixture: ComponentFixture<ManageTaxGroupsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ManageTaxGroupsComponent],
      providers: [
        {
          provide: ActivatedRoute,
          useValue: {
            params: of({ id: '123' }) // Proporciona los parámetros necesarios para ActivatedRoute
          }
        }
      ]
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ManageTaxGroupsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
