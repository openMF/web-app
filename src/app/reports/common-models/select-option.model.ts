/** Select Option model */
export class SelectOption {

    id: number;
    name: string;

    constructor(options: any[]) {
        this.id = options[0],
        this.name = options[1];
    }
}
