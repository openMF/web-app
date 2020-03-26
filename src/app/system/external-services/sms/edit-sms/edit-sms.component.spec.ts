import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { AppTestingModule } from '../../../../app-testing.module';

import { EditSMSComponent } from './edit-sms.component';

 fdescribe('EditSMSComponent', () => {
  let component: EditSMSComponent;
  let fixture: ComponentFixture<EditSMSComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [ AppTestingModule ],
      declarations: [ EditSMSComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(EditSMSComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
