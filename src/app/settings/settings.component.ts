import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'mifosx-settings',
  templateUrl: './settings.component.html',
  styleUrls: ['./settings.component.scss']
})
export class SettingsComponent implements OnInit {

  languages: string[];
  dateFormats: string[];
  fonts: string[];

  constructor() { }

  ngOnInit() {
  }

}
