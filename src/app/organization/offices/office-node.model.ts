/**
 * Office Node model.
 */
 export class OfficeNode {

  /** Office Node children. */
  children: OfficeNode[];

  name: string;
  id: string;
  parentId: string;
  hierarchy: string;
  externalId: string;
  parentName: string;
  openingDate: string;

  constructor(name: string,
              id: string = '',
              parentId: string = '',
              hierarchy: string = '',
              externalId: string = '',
              parentName: string = '',
              openingDate: string = '') {
    this.name = name;
    this.id = id;
    this.parentId = parentId;
    this.hierarchy = hierarchy;
    this.externalId = externalId;
    this.parentName = parentName;
    this.openingDate = openingDate;
    this.children = [];
  }

}
