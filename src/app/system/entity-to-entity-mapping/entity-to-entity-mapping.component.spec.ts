import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { EntityToEntityMappingComponent } from './entity-to-entity-mapping.component';
import { ActivatedRoute } from '@angular/router';
import { of } from 'rxjs';
import { ReactiveFormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';
import { CommonModule, DatePipe } from '@angular/common';

describe('EntityToEntityMappingComponent', () => {
  let component: EntityToEntityMappingComponent;
  let fixture: ComponentFixture<EntityToEntityMappingComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [EntityToEntityMappingComponent],
      imports: [
        ReactiveFormsModule,
        HttpClientModule,
        CommonModule
      ],
      providers: [
        DatePipe,
        {
          provide: ActivatedRoute,
          useValue: {
            params: of({ id: '123' })
          }
        }
      ]
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(EntityToEntityMappingComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
