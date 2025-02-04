import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { RejectFixedDepositsAccountComponent } from './reject-fixed-deposits-account.component';
import { ReactiveFormsModule } from '@angular/forms';
import { TranslateFakeLoader, TranslateLoader, TranslateModule } from '@ngx-translate/core';

describe('RejectFixedDepositsAccountComponent', () => {
  let component: RejectFixedDepositsAccountComponent;
  let fixture: ComponentFixture<RejectFixedDepositsAccountComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [RejectFixedDepositsAccountComponent],
      imports: [
        ReactiveFormsModule,
        TranslateModule.forRoot({
          loader: { provide: TranslateLoader, useClass: TranslateFakeLoader }
        })

      ]
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(RejectFixedDepositsAccountComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
