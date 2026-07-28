import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { of } from 'rxjs';

import { SiteSelectorComponent } from './site-selector.component';
import { OrganizationService } from 'app/organization/organization.service';

describe('SiteSelectorComponent', () => {
  let component: SiteSelectorComponent;
  let fixture: ComponentFixture<SiteSelectorComponent>;
  let organizationService: jasmine.SpyObj<OrganizationService>;

  beforeEach(async () => {
    organizationService = jasmine.createSpyObj<OrganizationService>('OrganizationService', ['fetchByHierarchyLevel']);
    organizationService.fetchByHierarchyLevel.and.returnValue(of([]));

    await TestBed.configureTestingModule({
      imports: [ReactiveFormsModule],
      declarations: [SiteSelectorComponent],
      providers: [
        { provide: OrganizationService, useValue: organizationService },
        { provide: SettingsService, useValue: settingsService },
      ],
    })
      .overrideTemplate(SiteSelectorComponent, '')
      .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(SiteSelectorComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    fixture.detectChanges();
    expect(component).toBeTruthy();
  });

  it('should load regions when countryId is set on init', () => {
    component.countryId = 1;
    fixture.detectChanges();
    expect(organizationService.fetchByHierarchyLevel).toHaveBeenCalledWith(1, 'LOWER');
  });

  it('should load districts when a region is selected', () => {
    component.countryId = 1;
    fixture.detectChanges();
    component.onRegionChange({ id: 5 });
    expect(organizationService.fetchByHierarchyLevel).toHaveBeenCalledWith(5, 'LOWER');
  });

  it('should reset site selection to All Sites when district changes', () => {
    component.countryId = 1;
    fixture.detectChanges();
    component.onDistrictChange({ id: 10 });
    expect(component.siteSelectorForm.get('siteIds').value).toBeNull();
  });
});
