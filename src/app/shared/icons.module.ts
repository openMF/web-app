/** Angular Imports */
import { NgModule } from '@angular/core';

/** Angular Font Awesome Imports */
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { library } from '@fortawesome/fontawesome-svg-core';
import {
  faArchive,
  faBars,
  faBell,
  faCalendar,
  faChartBar,
  faCheckCircle,
  faChevronDown,
  faChevronLeft,
  faChevronRight,
  faCircle,
  faCog,
  faCogs,
  faEdit,
  faEye,
  faEyeSlash,
  faFileUpload,
  faFillDrip,
  faHandHoldingUsd,
  faHome,
  faLink,
  faList,
  faLocationArrow,
  faLock,
  faLockOpen,
  faMinusCircle,
  faMoneyBillAlt,
  faPlay,
  faPlus,
  faPlusCircle,
  faSearch,
  faShieldAlt,
  faSignOutAlt,
  faSitemap,
  faSync,
  faTachometerAlt,
  faTimesCircle,
  faTrash,
  faUndo,
  faUniversity,
  faUserCircle,
  faUsers,
  faUserShield
} from '@fortawesome/free-solid-svg-icons';

/** Add icons to the library for convenient access in other components. */
library.add(
  faArchive,
  faBars,
  faBell,
  faCalendar,
  faChartBar,
  faCheckCircle,
  faChevronDown,
  faChevronLeft,
  faChevronRight,
  faCircle,
  faCog,
  faCogs,
  faEdit,
  faEye,
  faEyeSlash,
  faFileUpload,
  faFillDrip,
  faHandHoldingUsd,
  faHome,
  faLink,
  faList,
  faLocationArrow,
  faLock,
  faLockOpen,
  faMinusCircle,
  faMoneyBillAlt,
  faPlay,
  faPlus,
  faPlusCircle,
  faSearch,
  faShieldAlt,
  faSignOutAlt,
  faSitemap,
  faSync,
  faTachometerAlt,
  faTimesCircle,
  faTrash,
  faUndo,
  faUniversity,
  faUserCircle,
  faUsers,
  faUserShield
);

/**
 * Icons Module
 *
 * Angular Font Awesome module is exported here.
 */
@NgModule({
  exports: [FontAwesomeModule]
})
export class IconsModule { }

