export class GLAccountNode {
  children: GLAccountNode[];
  name: string;
  glCode: string;
  type: string;
  usage: string;
  manualEntriesAllowed: boolean;
  description: string;
  constructor(name: string,
              glCode: string = '',
              type: string = '',
              usage: string = '',
              manualEntriesAllowed: boolean = false,
              description: string = '') {
    this.name = name;
    this.glCode = glCode;
    this.type = type;
    this.usage = usage;
    this.manualEntriesAllowed = manualEntriesAllowed;
    this.description = description;
    this.children = [];
  }
}
