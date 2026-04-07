/**
 * Copyright since 2025 Mifos Initiative
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

export class Survey {
  id: number;
  key: string;
  name: string;
  countryCode: string;
  description: string;
  questionDatas: Array<QuestionData>;
}

export class QuestionData {
  id: number;
  key: string;
  sequenceNo: number;
  text: string;
  description: string;
  responseDatas: Array<ResponseData>;
}

export class ResponseData {
  id: number;
  sequenceNo: number;
  text: string;
  value: number;
}
