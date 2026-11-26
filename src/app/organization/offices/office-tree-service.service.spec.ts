/**
 * Copyright since 2025 Mifos Initiative
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { beforeEach, describe, expect, it } from '@jest/globals';
import { OfficeTreeService } from './office-tree-service.service';

describe('OfficeTreeService', () => {
  let service: OfficeTreeService;

  beforeEach(() => {
    service = new OfficeTreeService();
  });

  it('nests offices under their parent and keeps the details of the head office', () => {
    const [headOffice] = service.buildOfficeTree([
      { id: 1, name: 'Head Office', hierarchy: '.', externalId: 'HO', openingDate: [
          2009,
          1,
          1
        ] },
      { id: 2, name: 'Branch', hierarchy: '.2.', parentId: 1, parentName: 'Head Office' },
      { id: 3, name: 'Sub-branch', hierarchy: '.2.3.', parentId: 2, parentName: 'Branch' }
    ]);

    expect(headOffice.externalId).toBe('HO');
    expect(headOffice.openingDate).toEqual([
      2009,
      1,
      1
    ]);
    expect(headOffice.children.map((office) => office.name)).toEqual(['Branch']);
    expect(headOffice.children[0].children[0].name).toBe('Sub-branch');
    expect(headOffice.children[0].children[0].parent).toBe(headOffice.children[0]);
  });

  it('places an office at the top level when its parent is not in the list', () => {
    const tree = service.buildOfficeTree([
      { id: 18, name: 'Branch', hierarchy: '.18.', parentId: 1, parentName: 'Head Office' },
      { id: 22, name: 'Sub-branch', hierarchy: '.18.22.', parentId: 18, parentName: 'Branch' }
    ]);

    expect(tree.map((office) => office.name)).toEqual(['Branch']);
    expect(tree[0].parentName).toBe('Head Office');
    expect(tree[0].children.map((office) => office.name)).toEqual(['Sub-branch']);
  });

  it('does not depend on the id of the head office', () => {
    const tree = service.buildOfficeTree([
      { id: 6, name: 'Branch', hierarchy: '.6.', parentId: 5 },
      { id: 5, name: 'Head Office', hierarchy: '.' }
    ]);

    expect(tree.map((office) => office.name)).toEqual(['Head Office']);
    expect(tree[0].children.map((office) => office.name)).toEqual(['Branch']);
  });

  it('sorts offices by name without changing the offices data', () => {
    const offices = [
      { id: 1, name: 'Head Office', hierarchy: '.' },
      { id: 2, name: 'West', hierarchy: '.2.', parentId: 1 },
      { id: 3, name: 'East', hierarchy: '.3.', parentId: 1 }
    ];
    const copy = JSON.parse(JSON.stringify(offices));

    expect(service.buildOfficeTree(offices)[0].children.map((office) => office.name)).toEqual([
      'East',
      'West'
    ]);
    expect(offices).toEqual(copy);
  });

  it('returns an empty tree when there are no offices', () => {
    expect(service.buildOfficeTree([])).toEqual([]);
  });
});
