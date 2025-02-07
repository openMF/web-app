import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ProvisioningEntriesComponent } from './provisioning-entries.component';
import { HttpClientModule } from '@angular/common/http';
import { ActivatedRoute } from '@angular/router';
import { of } from 'rxjs';
import { RouterTestingModule } from '@angular/router/testing';

describe('ProvisioningEntriesComponent', () => {
  let component: ProvisioningEntriesComponent;
  let fixture: ComponentFixture<ProvisioningEntriesComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ProvisioningEntriesComponent],
      imports: [
        HttpClientModule,
        RouterTestingModule
      ],
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
    fixture = TestBed.createComponent(ProvisioningEntriesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
