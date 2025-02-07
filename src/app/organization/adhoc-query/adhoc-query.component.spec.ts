import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AdhocQueryComponent } from './adhoc-query.component';
import { RouterTestingModule } from '@angular/router/testing';
import { TranslateFakeLoader, TranslateLoader, TranslateModule, TranslateService } from '@ngx-translate/core';

describe('AdhocQueryComponent', () => {
  let component: AdhocQueryComponent;
  let fixture: ComponentFixture<AdhocQueryComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [AdhocQueryComponent],
      imports: [
        RouterTestingModule,
        TranslateModule.forRoot({
          loader: { provide: TranslateLoader, useClass: TranslateFakeLoader }
        })

      ],
      providers: [TranslateService]
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AdhocQueryComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
