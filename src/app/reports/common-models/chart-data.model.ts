/** Chart Data Model */
export class ChartData {

  keysLabel: string;
  valuesLabel: string;
  keys: string[];
  values: number[];

  constructor(response: any) {
    this.keysLabel = response.columnHeaders[0].columnName;
    this.valuesLabel = response.columnHeaders[1].columnName;
    this.keys = response.data.map((object: any) => object.row[0]);
    this.values = response.data.map((object: any) => object.row[1]);
  }

}
