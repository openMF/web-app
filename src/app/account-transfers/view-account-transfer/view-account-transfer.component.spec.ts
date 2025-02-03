import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ViewAccountTransferComponent } from './view-account-transfer.component';
import { RouterModule } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { TranslateModule, TranslateService } from '@ngx-translate/core';

describe('ViewAccountTransferComponent', () => {
  let component: ViewAccountTransferComponent;
  let fixture: ComponentFixture<ViewAccountTransferComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ViewAccountTransferComponent],
      imports: [
        RouterTestingModule,
        TranslateModule
      ],
      providers: [TranslateService]
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ViewAccountTransferComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
