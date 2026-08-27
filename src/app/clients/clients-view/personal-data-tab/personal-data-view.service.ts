/**
 * Copyright since 2025 Mifos Initiative
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { Injectable, inject } from '@angular/core';
import { forkJoin, Observable, of } from 'rxjs';
import { catchError, map, switchMap } from 'rxjs/operators';

import { ClientsService } from 'app/clients/clients.service';
import { Datatables } from 'app/core/utils/datatables';
import { formatDatatableDisplayLabel } from 'app/pipes/datatable-display-label.pipe';
import {
  PersonalDataField,
  PersonalDataTableColumn,
  PersonalDataTableRecord,
  PersonalDataTableSection,
  PersonalDataViewModel
} from './personal-data-view.model';
import {
  ENTITY_PERSONAL_DATA_DATATABLES,
  PERSON_PERSONAL_DATA_DATATABLES,
  PersonalDataDatatableSectionConfig
} from 'app/clients/models/personal-data-datatables.model';

@Injectable({
  providedIn: 'root'
})
export class PersonalDataViewService {
  private clientsService = inject(ClientsService);
  private datatables = inject(Datatables);

  load(clientId: string, clientDatatables: any[] = [], isEntity = false): Observable<PersonalDataViewModel> {
    const sectionConfigs = isEntity ? ENTITY_PERSONAL_DATA_DATATABLES : PERSON_PERSONAL_DATA_DATATABLES;
    const relevantDatatables = this.findRelevantDatatables(clientDatatables, sectionConfigs);

    return forkJoin({
      addresses: this.clientsService.getClientAddressData(clientId).pipe(
        map((addresses: any) => (Array.isArray(addresses) ? addresses : [])),
        catchError(() => of([]))
      ),
      addressTemplate: this.clientsService.getClientAddressTemplate().pipe(catchError(() => of(null))),
      familyMembers: this.clientsService.getClientFamilyMembers(clientId).pipe(
        map((familyMembers: any) => (Array.isArray(familyMembers) ? familyMembers : [])),
        catchError(() => of([]))
      ),
      identifiers: this.loadIdentifiers(clientId),
      documents: this.clientsService.getClientDocuments(clientId).pipe(
        map((documents: any) => (Array.isArray(documents) ? documents : [])),
        catchError(() => of([]))
      ),
      datatableSections: this.loadDatatableSections(clientId, relevantDatatables, sectionConfigs)
    });
  }

  private loadIdentifiers(clientId: string): Observable<any[]> {
    return this.clientsService.getClientIdentifiers(clientId).pipe(
      switchMap((identifiers: any[]) => {
        if (!identifiers?.length) {
          return of([]);
        }
        return forkJoin(
          identifiers.map((identifier: any) =>
            this.clientsService.getClientIdentificationDocuments(identifier.id).pipe(
              map((documents: any[]) => ({
                ...identifier,
                documents: documents || []
              })),
              catchError(() => of({ ...identifier, documents: [] }))
            )
          )
        );
      }),
      catchError(() => of([]))
    );
  }

  private loadDatatableSections(
    clientId: string,
    datatables: Array<{ datatable: any; config: PersonalDataDatatableSectionConfig }>,
    sectionConfigs: PersonalDataDatatableSectionConfig[]
  ): Observable<Record<string, PersonalDataTableSection[]>> {
    if (!datatables.length) {
      return of(this.emptyDatatableSections(sectionConfigs));
    }

    return forkJoin(
      datatables.map(({ datatable, config }) =>
        this.clientsService.getClientDatatable(clientId, datatable.registeredTableName).pipe(
          map((data: any) => ({
            key: config.key,
            section: this.toDatatableSection(config, datatable.registeredTableName, data, datatable)
          })),
          catchError(() =>
            of({
              key: config.key,
              section: this.emptyDatatableSection(config, datatable.registeredTableName, datatable)
            })
          )
        )
      )
    ).pipe(
      map((loadedSections) => {
        const sections = this.emptyDatatableSections(sectionConfigs);
        loadedSections.forEach(({ key, section }) => {
          sections[key] = [
            ...(sections[key] || []),
            section
          ];
        });
        return sections;
      })
    );
  }

  private findRelevantDatatables(
    datatables: any[],
    sectionConfigs: PersonalDataDatatableSectionConfig[]
  ): Array<{ datatable: any; config: PersonalDataDatatableSectionConfig }> {
    const configsByTableName = new Map(
      sectionConfigs.map((section) => [
        section.tableName,
        section
      ])
    );
    return (datatables || [])
      .map((datatable: any) => {
        const config = configsByTableName.get(datatable.registeredTableName);
        return config ? { datatable, config } : null;
      })
      .filter((match): match is { datatable: any; config: PersonalDataDatatableSectionConfig } => !!match);
  }

  private toDatatableSection(
    config: PersonalDataDatatableSectionConfig,
    sourceName: string,
    data: any,
    datatableMetadata?: any
  ): PersonalDataTableSection {
    const columnHeaders = data?.columnHeaders?.length ? data.columnHeaders : datatableMetadata?.columnHeaderData || [];
    const columns = this.datatables.filterSystemColumns(columnHeaders).map((column: any): PersonalDataTableColumn => ({
      ...column,
      columnName: column.columnName || column.name,
      label: this.displayColumnLabel(column.columnName || column.name),
      idx: column.idx
    }));
    const records = (data?.data || []).map((row: any) => this.toDatatableRecord(columns, row?.row || []));

    return {
      key: config.key,
      title: config.title,
      sourceName,
      columns,
      isMultiRow: columnHeaders[0]?.columnName === 'id',
      records
    };
  }

  private toDatatableRecord(columns: PersonalDataTableColumn[], row: any[]): PersonalDataTableRecord {
    return {
      id: row[0],
      fields: columns
        .map((column: PersonalDataTableColumn): PersonalDataField => ({
          label: column.label,
          columnName: column.columnName,
          value: row[column.idx]
        }))
        .filter((field) => field.columnName)
    };
  }

  private emptyDatatableSections(
    sectionConfigs: PersonalDataDatatableSectionConfig[]
  ): Record<string, PersonalDataTableSection[]> {
    return sectionConfigs.reduce(
      (sections: Record<string, PersonalDataTableSection[]>, config): Record<string, PersonalDataTableSection[]> => ({
        ...sections,
        [config.key]: []
      }),
      {} as Record<string, PersonalDataTableSection[]>
    );
  }

  private emptyDatatableSection(
    config: PersonalDataDatatableSectionConfig,
    sourceName: string,
    datatableMetadata?: any
  ): PersonalDataTableSection {
    const columnHeaders = datatableMetadata?.columnHeaderData || [];
    const columns = this.datatables.filterSystemColumns(columnHeaders).map((column: any): PersonalDataTableColumn => ({
      ...column,
      columnName: column.columnName || column.name,
      label: this.displayColumnLabel(column.columnName || column.name),
      idx: column.idx
    }));
    return {
      key: config.key,
      title: config.title,
      sourceName,
      columns,
      isMultiRow: columnHeaders[0]?.columnName === 'id',
      records: []
    };
  }

  private displayColumnLabel(columnName: string): string {
    const label = this.datatables.toDisplayLabel(columnName);
    return label.includes(' ') ? label : formatDatatableDisplayLabel(label);
  }
}
