import { TestBed, waitForAsync } from '@angular/core/testing';
import { SettingsService } from 'app/settings/settings.service';
import { DateFormatPipe } from './date-format.pipe';

describe('DateFormatPipe', () => {

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      imports: [ SettingsService ],
      declarations: [ DateFormatPipe ]
    })
    .compileComponents();
  }));

  it('create an instance', () => {
    const pipe = new DateFormatPipe(new SettingsService());
    expect(pipe).toBeTruthy();
  });
});
