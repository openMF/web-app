import { OrganisationModule } from './organisation.module';

describe('OrganisationModule', () => {
  let organisationModule: OrganisationModule;

  beforeEach(() => {
    organisationModule = new OrganisationModule();
  });

  it('should create an instance', () => {
    expect(organisationModule).toBeTruthy();
  });
});
