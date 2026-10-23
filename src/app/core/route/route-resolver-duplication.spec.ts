/**
 * Copyright since 2025 Mifos Initiative
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import * as fs from 'fs';
import * as nodePath from 'path';
import * as ts from 'typescript';

/**
 * Guards against a resolver being declared on a route and again on a descendant
 * route that already inherits it.
 *
 * Angular runs the resolvers of every activated route independently, so the same
 * resolver written twice in one branch issues the same request twice. The app's
 * HTTP cache is opt-in (`ExtendedHttpClient.cache()`), so both calls reach the
 * backend.
 *
 * Only genuinely redundant declarations are reported. A descendant that cannot
 * see its ancestor's data needs its own resolver, and so does one that exposes
 * the same resolver under a different key, and neither is flagged.
 */

interface RouteNode {
  file: string;
  line: number;
  /** The route's own `path`, or null when it declares none. */
  routePath: string | null;
  hasComponent: boolean;
  /** Resolve key -> resolver identifier. */
  resolvers: Map<string, string>;
  children: RouteNode[];
}

const ROUTE_FILE = /(-routing\.module|\.routes)\.ts$/;

function routingFiles(dir: string): string[] {
  const found: string[] = [];
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = nodePath.join(dir, entry.name);
    if (entry.isDirectory()) {
      found.push(...routingFiles(full));
    } else if (ROUTE_FILE.test(entry.name)) {
      found.push(full);
    }
  }
  return found;
}

function propertyNamed(obj: ts.ObjectLiteralExpression, name: string): ts.Expression | undefined {
  for (const prop of obj.properties) {
    if (ts.isPropertyAssignment(prop) && prop.name.getText() === name) {
      return prop.initializer;
    }
  }
  return undefined;
}

/**
 * Elements of a routes array. `Route.withShell([...])` contributes no resolvers
 * of its own, so the routes it wraps are read as members of the same array.
 */
function routeObjects(array: ts.ArrayLiteralExpression): ts.ObjectLiteralExpression[] {
  const objects: ts.ObjectLiteralExpression[] = [];
  for (const element of array.elements) {
    if (ts.isObjectLiteralExpression(element)) {
      objects.push(element);
    } else if (ts.isCallExpression(element)) {
      for (const argument of element.arguments) {
        if (ts.isArrayLiteralExpression(argument)) {
          objects.push(...routeObjects(argument));
        }
      }
    }
  }
  return objects;
}

function toRouteNode(obj: ts.ObjectLiteralExpression, source: ts.SourceFile, file: string): RouteNode {
  const resolvers = new Map<string, string>();
  const resolve = propertyNamed(obj, 'resolve');
  if (resolve && ts.isObjectLiteralExpression(resolve)) {
    for (const prop of resolve.properties) {
      if (ts.isPropertyAssignment(prop) && ts.isIdentifier(prop.initializer)) {
        resolvers.set(prop.name.getText(), prop.initializer.text);
      }
    }
  }

  const routePathNode = propertyNamed(obj, 'path');
  const children = propertyNamed(obj, 'children');

  return {
    file,
    line: source.getLineAndCharacterOfPosition(obj.getStart(source)).line + 1,
    routePath: routePathNode && ts.isStringLiteral(routePathNode) ? routePathNode.text : null,
    hasComponent: propertyNamed(obj, 'component') !== undefined,
    resolvers,
    children:
      children && ts.isArrayLiteralExpression(children)
        ? routeObjects(children).map((child) => toRouteNode(child, source, file))
        : []
  };
}

function parseRoutes(file: string): RouteNode[] {
  const source = ts.createSourceFile(file, fs.readFileSync(file, 'utf8'), ts.ScriptTarget.Latest, true);
  const roots: RouteNode[] = [];

  source.forEachChild((node) => {
    if (!ts.isVariableStatement(node)) {
      return;
    }
    for (const declaration of node.declarationList.declarations) {
      const isRoutesType = declaration.type?.getText() === 'Routes';
      if (isRoutesType && declaration.initializer && ts.isArrayLiteralExpression(declaration.initializer)) {
        roots.push(...routeObjects(declaration.initializer).map((obj) => toRouteNode(obj, source, file)));
      }
    }
  });

  return roots;
}

/**
 * The ancestors a route inherits resolved data from, following Angular's default
 * `paramsInheritanceStrategy: 'emptyOnly'`: walking up from the route, a step is
 * inherited while the lower route has an empty path or the upper route declares
 * no component of its own.
 */
function inheritedAncestors(chain: RouteNode[]): RouteNode[] {
  let from = chain.length - 1;
  while (from >= 1) {
    const current = chain[from];
    const parent = chain[from - 1];
    if (current.routePath === '' || !parent.hasComponent) {
      from--;
    } else {
      break;
    }
  }
  return chain.slice(from, chain.length - 1);
}

interface Duplicate {
  file: string;
  line: number;
  key: string;
  resolver: string;
  ancestorLine: number;
}

function findDuplicates(route: RouteNode, chain: RouteNode[], found: Duplicate[]): void {
  const here = [
    ...chain,
    route
  ];
  for (const ancestor of inheritedAncestors(here)) {
    for (const [
      key,
      resolver
    ] of route.resolvers) {
      if (ancestor.resolvers.get(key) === resolver) {
        found.push({ file: route.file, line: route.line, key, resolver, ancestorLine: ancestor.line });
      }
    }
  }
  for (const child of route.children) {
    findDuplicates(child, here, found);
  }
}

describe('route resolvers', () => {
  it('are never declared again on a descendant route that already inherits them', () => {
    const files = routingFiles(nodePath.join(process.cwd(), 'src', 'app'));
    expect(files.length).toBeGreaterThan(0);

    const duplicates: Duplicate[] = [];
    for (const file of files) {
      for (const root of parseRoutes(file)) {
        findDuplicates(root, [], duplicates);
      }
    }

    const report = duplicates.map(
      (d) =>
        `${nodePath.relative(process.cwd(), d.file).split(nodePath.sep).join('/')}:${d.line} ` +
        `declares "${d.key}: ${d.resolver}", already resolved by the route on line ${d.ancestorLine}`
    );

    expect(report).toEqual([]);
  });
});
