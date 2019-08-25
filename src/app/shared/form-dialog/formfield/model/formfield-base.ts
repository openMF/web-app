export class FormfieldBase {

  controlType: string;
  controlName: string;
  label: string;
  value: string;
  required: boolean;
  order: number;

  constructor(options: {
              controlType?: string,
              controlName?: string,
              label?: string,
              value?: string,
              required?: boolean,
              order?: number
    } = {}) {
      this.controlType = options.controlType || '';
      this.controlName = options.controlName || '';
      this.label = options.label || '';
      this.value = options.value === undefined ? '' : options.value;
      this.required = !!options.required;
      this.order = options.order === undefined ? 1 : options.order;
  }

}
