/**
 * Copyright since 2025 Mifos Initiative
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { Component, EventEmitter, Input, Output, inject, OnInit } from '@angular/core';
import { STANDALONE_SHARED_IMPORTS } from '../../../standalone-shared.module';
import { MatIcon } from '@angular/material/icon';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { Observable, of } from 'rxjs';
import { debounceTime, distinctUntilChanged, switchMap, startWith, catchError, map } from 'rxjs/operators';

import { ValidatedRecipient } from '../../models/beneficiary.model';
import { ClientsService } from '../../../clients/clients.service';

interface ClientSearchResult {
  id: number;
  displayName: string;
  accountNo: string;
  externalId: string;
}

@Component({
  selector: 'mifosx-beneficiary-details-step',
  standalone: true,
  imports: [
    ...STANDALONE_SHARED_IMPORTS,
    MatIcon,
    ReactiveFormsModule,
    MatAutocompleteModule
  ],
  templateUrl: './beneficiary-details-step.component.html',
  styleUrls: ['./beneficiary-details-step.component.scss']
})
export class BeneficiaryDetailsStepComponent implements OnInit {
  @Input() recipientData: ValidatedRecipient | null = null;
  @Output() beneficiaryNext = new EventEmitter<number>();

  private clientsService = inject(ClientsService);

  clientSearchControl = new FormControl<string | ClientSearchResult>('');
  filteredClients$!: Observable<ClientSearchResult[]>;
  selectedClient: ClientSearchResult | null = null;
  searchError = false;

  ngOnInit(): void {
    this.filteredClients$ = this.clientSearchControl.valueChanges.pipe(
      startWith(''),
      debounceTime(300),
      distinctUntilChanged(),
      switchMap((searchValue) => {
        const searchText = typeof searchValue === 'string' ? searchValue : '';
        if (!searchText || searchText.trim().length < 2) {
          return of([]);
        }
        return this.searchClients(searchText.trim());
      })
    );
  }

  private searchClients(searchText: string): Observable<ClientSearchResult[]> {
    this.searchError = false;
    return this.clientsService.searchByText(searchText, 0, 20, '', '').pipe(
      map((response: any) => {
        const clients = response?.content || [];
        return clients.map((client: any) => ({
          id: client.id,
          displayName: client.displayName || '',
          accountNo: client.accountNumber || '',
          externalId: client.externalId || ''
        }));
      }),
      catchError(() => {
        this.searchError = true;
        return of([]);
      })
    );
  }

  onClientSelected(client: ClientSearchResult): void {
    this.selectedClient = client;
    this.clientSearchControl.setValue(client.displayName);
  }

  displayFn = (value: string | ClientSearchResult): string => {
    return typeof value === 'string' ? value : value?.displayName || '';
  };

  onNext(): void {
    if (this.selectedClient) {
      this.beneficiaryNext.emit(this.selectedClient.id);
    }
  }
}
