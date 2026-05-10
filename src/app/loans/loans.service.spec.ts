import { TestBed } from '@angular/core/testing';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { provideHttpClient } from '@angular/common/http';
import { LoansService } from './loans.service';
import { SettingsService } from 'app/settings/settings.service';
import { Dates } from 'app/core/utils/dates';

describe('LoansService', () => {
  let service: LoansService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    const mockSettings: Partial<SettingsService> = {
      language: { name: 'English', code: 'en' },
      dateFormat: 'yyyy-MM-dd',
      businessDate: new Date(),
      maxFutureDate: new Date()
    };
    const mockDates: Partial<Dates> = {
      formatDate: (d: any) => d,
      formatDateAsString: (d: any) => String(d)
    } as any;

    TestBed.configureTestingModule({
      providers: [
        LoansService,
        provideHttpClient(),
        provideHttpClientTesting(),
        { provide: SettingsService, useValue: mockSettings },
        { provide: Dates, useValue: mockDates }]
    });
    service = TestBed.inject(LoansService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should sanitize all GSIM fields before posting calculateLoanSchedule', () => {
    const payload = {
      principal: 1000,
      linkAccountId: 42,
      linkAccountOwnerName: 'Alice',
      linkedSavingsAccount: { id: 5 },
      nested: {
        linkAccountOwnerId: 7,
        linkAccountOwnerName: 'Bob',
        ok: 'keep'
      },
      members: [
        { id: 1, linkAccountId: 99 },
        { id: 2, name: 'foo', linkedSavingsAccount: { id: 9 } }
      ]
    } as any;

    const original = JSON.parse(JSON.stringify(payload));

    service.calculateLoanSchedule(payload).subscribe(() => {});

    const req = httpMock.expectOne('/loans?command=calculateLoanSchedule');
    expect(req.request.method).toBe('POST');

    const body = req.request.body;

    // All forbidden keys should be removed at every depth
    expect(body.linkAccountId).toBeUndefined();
    expect(body.linkAccountOwnerName).toBeUndefined();
    expect(body.linkedSavingsAccount).toBeUndefined();
    expect(body.nested.linkAccountOwnerId).toBeUndefined();
    expect(body.nested.linkAccountOwnerName).toBeUndefined();
    expect(body.members[0].linkAccountId).toBeUndefined();
    expect(body.members[1].linkedSavingsAccount).toBeUndefined();

    // Allowed keys should be preserved
    expect(body.principal).toBe(1000);
    expect(body.nested.ok).toBe('keep');
    expect(body.members[1].name).toBe('foo');

    // Original caller payload must remain unmutated
    expect(payload).toEqual(original);

    req.flush({});
  });

  it('should keep non-object primitives intact', () => {
    const payload = { value: 1, text: 'abc' };
    service.calculateLoanSchedule(payload).subscribe(() => {});
    const req = httpMock.expectOne('/loans?command=calculateLoanSchedule');
    expect(req.request.body.value).toBe(1);
    expect(req.request.body.text).toBe('abc');
    req.flush({});
  });
});
