import { Component, OnInit, Input, EventEmitter, Output } from '@angular/core';
import { MatSidenav, MatMenuTrigger } from '@angular/material';
import { BreakpointObserver, Breakpoints } from '@angular/cdk/layout';
import {style, state, animate, transition, trigger} from '@angular/animations';

import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

@Component({
  selector: 'mifosx-toolbar',
  templateUrl: './toolbar.component.html',
  styleUrls: ['./toolbar.component.scss'],
  animations: [
    trigger('fadeInOut', [
      transition(':enter', [
        style({ opacity: 0 }),
        animate(500, style({ opacity: 1 }))
      ]),
      transition(':leave', [
        animate(500, style({ opacity: 0 }))
      ])
    ])
  ]
})
export class ToolbarComponent implements OnInit {

  isHandset$: Observable<boolean> = this.breakpointObserver.observe(Breakpoints.Handset)
  .pipe(
    map(result => result.matches)
  );

  isHandset: boolean;
  searchVisible = false;
  selectedLanguage = 'English';
  sidenavCollapsed = false;

  @Input() sidenav: MatSidenav;
  @Output() collapse = new EventEmitter<boolean>();

  constructor(private breakpointObserver: BreakpointObserver) { }

  ngOnInit() {
    this.isHandset$.subscribe(isHandset => {
      this.isHandset = isHandset;
    });
  }

  toggleSidenav() {
    this.sidenav.toggle();
  }

  toggleCollapse() {
    this.sidenavCollapsed = !this.sidenavCollapsed;
    this.collapse.emit(this.sidenavCollapsed);
  }

  toggleVisibility() {
    this.searchVisible = !this.searchVisible;
  }

  onMouseEnter(menuTrigger: MatMenuTrigger) {
    if (!this.isHandset) {
      menuTrigger.openMenu();
    }
  }

}
