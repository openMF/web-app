/**
 * Copyright since 2025 Mifos Initiative
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

/** A key/value mapping a template can use to resolve its parameters. */
export interface TemplateMapper {
  mapperorder: number;
  mapperkey: string;
  mappervalue: string;
}

/** A template as returned by the templates API. */
export interface Template {
  id: number;
  name: string;
  /** Entity the template is for, such as `client` or `loan`. */
  entity: string;
  /** Template type, such as `Document`, `E-Mail` or `SMS`. */
  type: string;
  /** Template text: plain text or HTML markup with `${parameter}` placeholders. */
  text: string;
  mappers?: TemplateMapper[];
}
