import { NgModule } from '@angular/core';

import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { library } from '@fortawesome/fontawesome-svg-core';
import {
  faFileUpload,
  faSearch
} from '@fortawesome/free-solid-svg-icons';

// Add an icon to the library for convenient access in other components
library.add(
  faFileUpload,
  faSearch
);

@NgModule({
  imports: [],
  declarations: [],
  exports: [FontAwesomeModule]
})
export class IconsModule { }

