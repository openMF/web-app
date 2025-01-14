export interface SearchData {
  entityId: number;
  entityAccountNo: string;
  entityExternalId: string;
  entityName: string;
  entityType: string;
  parentId: number;
  parentName: string;
  entityStatus: EntityStatus;
  parentType: string;
  subEntityType: string;
}

export interface EntityStatus {
  id: number;
  code: string;
  value: string;
}
