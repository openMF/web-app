import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'mifosx-navigation',
  templateUrl: './navigation.component.html',
  styleUrls: ['./navigation.component.scss']
})
export class NavigationComponent implements OnInit {

  currentJustify = 'start';

  constructor() { }

  ngOnInit() {
  }

}
