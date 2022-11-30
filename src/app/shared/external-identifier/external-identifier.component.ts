import { Component, Input, OnInit } from '@angular/core';

@Component({
  selector: 'mifosx-external-identifier',
  templateUrl: './external-identifier.component.html',
  styleUrls: ['./external-identifier.component.scss']
})
export class ExternalIdentifierComponent implements OnInit {
  @Input() externalId: string;

  constructor() { }

  ngOnInit(): void {
  }

  isLongValue(): boolean {
    if (this.externalId == null) {
      return false;
    }
    return (this.externalId.length > 15);
  }

}
