import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { GroupTransferClientsComponent } from './group-transfer-clients.component';
import { ReactiveFormsModule } from '@angular/forms';
import { of } from 'rxjs';
import { ActivatedRoute } from '@angular/router';

describe('GroupTransferClientsComponent', () => {
  let component: GroupTransferClientsComponent;
  let fixture: ComponentFixture<GroupTransferClientsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [GroupTransferClientsComponent],
      imports: [ReactiveFormsModule],
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
    fixture = TestBed.createComponent(GroupTransferClientsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
