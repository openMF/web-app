/** Report Parameter Model */
export class ReportParameter {

    name: string;
    variable: string;
    label: string;
    displayType: string;
    formatType: string;
    defaultVal: any;
    selectOne: any;
    selectAll: any;
    parentParameterName: string;
    inputName: string;
    selectOptions: any[] = [];
    childParameters: any[] = [];
    pentahoName: any;

    constructor(options: any[]) {
        this.name = options[0];
        this.variable = options[1];
        this.label = options[2];
        this.displayType = options[3];
        this.formatType = options[4];
        this.defaultVal = options[5];
        this.selectOne = options[6];
        this.selectAll = options[7];
        this.parentParameterName = options[8];
        this.inputName = `R_${options[1]}`;
    }

}
