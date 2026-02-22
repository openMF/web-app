import { TestBed } from '@angular/core/testing';
import { DatePipe } from '@angular/common';
import { Dates } from './dates';

describe('Dates', () => {
  let service: Dates;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        Dates,
        DatePipe
      ]
    });
    service = TestBed.inject(Dates);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('angularToMomentFormat', () => {
    it('should convert dd/MM/yyyy to DD/MM/YYYY', () => {
      expect(service.angularToMomentFormat('dd/MM/yyyy')).toBe('DD/MM/YYYY');
    });

    it('should convert d MMMM yy to D MMMM YY', () => {
      expect(service.angularToMomentFormat('d MMMM yy')).toBe('D MMMM YY');
    });

    it('should convert yyyy-MM-dd HH:mm:ss to YYYY-MM-DD HH:mm:ss', () => {
      expect(service.angularToMomentFormat('yyyy-MM-dd HH:mm:ss')).toBe('YYYY-MM-DD HH:mm:ss');
    });

    it('should handle single characters d/M/y to D/M/Y', () => {
      expect(service.angularToMomentFormat('d/M/y')).toBe('D/M/Y');
    });

    it('should preserve other characters like HH:mm a to HH:mm A', () => {
      expect(service.angularToMomentFormat('HH:mm a')).toBe('HH:mm A');
    });

    it('should convert dd MMMM yyyy to DD MMMM YYYY', () => {
      expect(service.angularToMomentFormat('dd MMMM yyyy')).toBe('DD MMMM YYYY');
    });

    it('should convert all y variants: y, yy, yyy, yyyy', () => {
      expect(service.angularToMomentFormat('y')).toBe('Y');
      expect(service.angularToMomentFormat('yy')).toBe('YY');
      expect(service.angularToMomentFormat('yyy')).toBe('YYY');
      expect(service.angularToMomentFormat('yyyy')).toBe('YYYY');
    });

    it('should convert all d variants: d, dd', () => {
      expect(service.angularToMomentFormat('d')).toBe('D');
      expect(service.angularToMomentFormat('dd')).toBe('DD');
    });

    it('should handle complex format with all patterns', () => {
      expect(service.angularToMomentFormat('dd-MM-yyyy HH:mm:ss a')).toBe('DD-MM-YYYY HH:mm:ss A');
    });

    it('should preserve MM (month) unchanged', () => {
      expect(service.angularToMomentFormat('MM')).toBe('MM');
    });

    it('should preserve time components HH, mm, ss unchanged', () => {
      expect(service.angularToMomentFormat('HH:mm:ss')).toBe('HH:mm:ss');
    });

    describe('App-Supported Formats', () => {
      const formats = [
        // HH:mm:ss variants
        { angular: 'dd MMMM yyyy HH:mm:ss', moment: 'DD MMMM YYYY HH:mm:ss' },
        { angular: 'dd/MMMM/yyyy HH:mm:ss', moment: 'DD/MMMM/YYYY HH:mm:ss' },
        { angular: 'dd-MMMM-yyyy HH:mm:ss', moment: 'DD-MMMM-YYYY HH:mm:ss' },
        { angular: 'dd-MM-yy HH:mm:ss', moment: 'DD-MM-YY HH:mm:ss' },
        { angular: 'MMMM-dd-yyyy HH:mm:ss', moment: 'MMMM-DD-YYYY HH:mm:ss' },
        { angular: 'MMMM dd yyyy HH:mm:ss', moment: 'MMMM DD YYYY HH:mm:ss' },
        { angular: 'MMMM/dd/yyyy HH:mm:ss', moment: 'MMMM/DD/YYYY HH:mm:ss' },
        { angular: 'MM-dd-yy HH:mm:ss', moment: 'MM-DD-YY HH:mm:ss' },
        { angular: 'yyyy-MM-dd HH:mm:ss', moment: 'YYYY-MM-DD HH:mm:ss' },
        // HH:mm variants
        { angular: 'dd MMMM yyyy HH:mm', moment: 'DD MMMM YYYY HH:mm' },
        { angular: 'dd/MMMM/yyyy HH:mm', moment: 'DD/MMMM/YYYY HH:mm' },
        { angular: 'dd-MMMM-yyyy HH:mm', moment: 'DD-MMMM-YYYY HH:mm' },
        { angular: 'dd-MM-yy HH:mm', moment: 'DD-MM-YY HH:mm' },
        { angular: 'MMMM-dd-yyyy HH:mm', moment: 'MMMM-DD-YYYY HH:mm' },
        { angular: 'MMMM dd yyyy HH:mm', moment: 'MMMM DD YYYY HH:mm' },
        { angular: 'MMMM/dd/yyyy HH:mm', moment: 'MMMM/DD/YYYY HH:mm' },
        { angular: 'MM-dd-yy HH:mm', moment: 'MM-DD-YY HH:mm' },
        { angular: 'yyyy-MM-dd HH:mm', moment: 'YYYY-MM-DD HH:mm' }
      ];

      formats.forEach((f) => {
        it(`should convert "${f.angular}" to "${f.moment}"`, () => {
          expect(service.angularToMomentFormat(f.angular)).toBe(f.moment);
        });
      });
    });
  });
});
