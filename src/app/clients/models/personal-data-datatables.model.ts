/**
 * Copyright since 2025 Mifos Initiative
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

export interface PersonalDataDatatableSectionConfig {
  key: string;
  title: string;
  tableName: string;
}

export const PERSON_PERSONAL_DATA_DATATABLES: PersonalDataDatatableSectionConfig[] = [
  {
    key: 'additionalProfile',
    title: 'labels.heading.General Client Information',
    tableName: 'client_additional_profile'
  },
  {
    key: 'socioeconomic',
    title: 'labels.heading.Socioeconomic Information',
    tableName: 'client_socioeconomic_information'
  },
  {
    key: 'personalReferences',
    title: 'labels.heading.Personal References',
    tableName: 'client_personal_references'
  },
  {
    key: 'commercialReferences',
    title: 'labels.heading.Commercial Reference',
    tableName: 'client_commercial_reference'
  },
  {
    key: 'beneficiaries',
    title: 'labels.heading.Beneficiaries',
    tableName: 'client_beneficiaries'
  },
  {
    key: 'pepPld',
    title: 'labels.heading.Client Type / PEP / PLD information',
    tableName: 'client_pep_pld'
  }
];

export const ENTITY_PERSONAL_DATA_DATATABLES: PersonalDataDatatableSectionConfig[] = [
  {
    key: 'entityLegalDetails',
    title: 'labels.heading.Legal Entity Details',
    tableName: 'entity_legal_details'
  },
  {
    key: 'legalRepresentative',
    title: 'labels.heading.Legal Representative',
    tableName: 'entity_legal_representative'
  },
  {
    key: 'addressLegalRepresentative',
    title: 'labels.heading.Address of Legal Representative',
    tableName: 'entity_address_legal_representative'
  },
  {
    key: 'authorizedRepresentative',
    title: 'labels.heading.Authorized Representative',
    tableName: 'entity_authorized_representative'
  },
  {
    key: 'addressAuthorizedRepresentative',
    title: 'labels.heading.Address of Authorized Representative',
    tableName: 'entity_address_authorized_representative'
  },
  {
    key: 'pepRelatedIndividuals',
    title: 'labels.heading.Politically Exposed Persons and Related Individuals',
    tableName: 'entity_pep_related_individuals'
  },
  {
    key: 'resourceProviderBeneficialOwner',
    title: 'labels.heading.Resource Provider / Beneficial Owner',
    tableName: 'entity_resource_provider_beneficial_owner'
  },
  {
    key: 'transactionalProfile',
    title: 'labels.heading.Customer Transactional Profile',
    tableName: 'entity_transactional_profile'
  },
  {
    key: 'shareholdingIndividuals',
    title: 'labels.heading.Shareholding Structure - Individuals',
    tableName: 'entity_shareholding_individuals'
  },
  {
    key: 'shareholdingLegalEntities',
    title: 'labels.heading.Shareholding Structure - Legal Entities',
    tableName: 'entity_shareholding_legal_entities'
  },
  {
    key: 'uboLegalEntities',
    title: 'labels.heading.Declaration of Ultimate Beneficial Owners - Legal Entities',
    tableName: 'entity_ubo_legal_entities'
  },
  {
    key: 'uboNaturalPersons',
    title: 'labels.heading.Declaration of Ultimate Beneficial Owners - Natural Persons',
    tableName: 'entity_ubo_natural_persons'
  },
  {
    key: 'controllingPersonPepQuestions',
    title: 'labels.heading.Controlling Person / PEP Related Questions',
    tableName: 'entity_controlling_person_pep_questions'
  }
];
