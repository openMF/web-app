/**
 * Copyright since 2025 Mifos Initiative
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

/** Angular Imports */
import { Component, inject } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

/** Custom Imports */
import { STANDALONE_SHARED_IMPORTS } from 'app/standalone-shared.module';
import { DateFormatPipe } from '../../../pipes/date-format.pipe';
import { LegalFormId } from 'app/clients/models/legal-form.enum';

/** Interfaces */
interface ClientViewData {
  id: number;
  accountNo?: string;
  externalId?: string;
  status?: { id: number; code: string; value: string };
  active?: boolean;
  activationDate?: number[];
  firstname?: string;
  middlename?: string;
  lastname?: string;
  fullname?: string;
  displayName?: string;
  mobileNo?: string;
  emailAddress?: string;
  dateOfBirth?: number[];
  gender?: { id: number; name: string; active?: boolean };
  clientType?: { id: number; name: string; active?: boolean };
  clientClassification?: { id: number; name: string; active?: boolean };
  legalForm?: { id: number; name: string };
  officeId?: number;
  officeName?: string;
  staffId?: number;
  staffName?: string;
  savingsProductId?: number;
  savingsProductName?: string;
  [key: string]: any; // Allow additional properties from API
}

/**
 * Personal Data Tab Component.
 * Displays all personal/client details in a read-only format.
 */
@Component({
  selector: 'mifosx-personal-data-tab',
  templateUrl: './personal-data-tab.component.html',
  styleUrls: ['./personal-data-tab.component.scss'],
  standalone: true,
  imports: [
    ...STANDALONE_SHARED_IMPORTS,
    DateFormatPipe
  ]
})
export class PersonalDataTabComponent {
  private route = inject(ActivatedRoute);

  /** Client View Data */
  clientViewData!: ClientViewData;

  constructor() {
    this.route.parent.data.pipe(takeUntilDestroyed()).subscribe((data: { clientViewData: ClientViewData }) => {
      this.clientViewData = data.clientViewData;
    });
  }

  /**
   * Check if client is a person (individual)
   */
  isPerson(): boolean {
    return this.clientViewData?.legalForm?.id === LegalFormId.PERSON;
  }

  /**
   * Check if client is a legal entity (organization)
   */
  isLegalEntity(): boolean {
    return this.clientViewData?.legalForm?.id === LegalFormId.ENTITY;
  }
}
