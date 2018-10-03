/** Angular Imports */
import { NgModule } from '@angular/core';

/** Angular Font Awesome Imports */
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { library } from '@fortawesome/fontawesome-svg-core';
import {
  faAnchor,
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
  faClock,
  faCog,
  faCogs,
  faEdit,
  faEye,
  faEyeSlash,
  faFileAlt,
  faFileUpload,
  faFileWord,
  faFillDrip,
  faHandHoldingUsd,
  faHome,
  faKey,
  faLink,
  faList,
  faListUl,
  faLocationArrow,
  faLock,
  faLockOpen,
  faMinusCircle,
  faMoneyBillAlt,
  faMoneyCheck,
  faPlay,
  faPlus,
  faPlusCircle,
  faRoad,
  faSearch,
  faShieldAlt,
  faSignOutAlt,
  faSitemap,
  faSync,
  faTable,
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
  faAnchor,
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
  faClock,
  faCog,
  faCogs,
  faEdit,
  faEye,
  faEyeSlash,
  faFileAlt,
  faFileUpload,
  faFileWord,
  faFillDrip,
  faHandHoldingUsd,
  faHome,
  faKey,
  faLink,
  faList,
  faListUl,
  faLocationArrow,
  faLock,
  faLockOpen,
  faMinusCircle,
  faMoneyBillAlt,
  faMoneyCheck,
  faPlay,
  faPlus,
  faPlusCircle,
  faRoad,
  faSearch,
  faShieldAlt,
  faSignOutAlt,
  faSitemap,
  faSync,
  faTable,
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
