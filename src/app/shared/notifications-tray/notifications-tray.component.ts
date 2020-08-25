/** Angular Imports */
import { Component, OnInit, OnDestroy, ViewEncapsulation } from '@angular/core';

/** RxJS Imports */
import { forkJoin } from 'rxjs';

/** Custom Services */
import { NotificationsService } from 'app/notifications/notifications.service';

/**
 * Notifications Tray Component
 */
@Component({
  selector: 'mifosx-notifications-tray',
  templateUrl: './notifications-tray.component.html',
  styleUrls: ['./notifications-tray.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class NotificationsTrayComponent implements OnInit, OnDestroy {

  /** Read Notifications */
  readNotifications: any[] = [];
  /** Displayed Read Notifications */
  displayedReadNotifications: any[] = [];
  /** Unread Notifications */
  unreadNotifications: any[] = [];
  /** Timer to refetch notifications every 60 seconds */
  timer: any;

  /**
   * Gets router link prefix from notification's objectType attribute
   * Shares, Savings, Deposits, Loans routes inaccessible because of dependency on entity ID.
   */
  routeMap: any = {
    'client' : '/clients/',
    'group' : '/groups/',
    'loan' : '/loans/',
    'center' : '/centers/',
    'shareAccount' : '/shares-accounts/',
    'fixedDeposit' : '/fixed-deposits-accounts/',
    'recurringDepositAccount': '/recurringdeposits/',
    'savingsAccount' : '/savings-accounts/',
    'shareProduct': '/products/share-products/',
    'loanProduct' : '/products/loan-products/'
  };

  /**
   * @param {NotificationsService} notificationsService Notifications Service
   */
  constructor(public notificationsService: NotificationsService) {
    forkJoin([this.notificationsService.getNotifications(true), this.notificationsService.getNotifications(false)])
    .subscribe((response: any[]) => {
      this.readNotifications = response[0].pageItems;
      this.unreadNotifications = response[1].pageItems;
      this.setNotifications();
    });
  }

  ngOnInit() {
    setTimeout(() => { this.fetchUnreadNotifications(); }, 60000);
  }

  ngOnDestroy() {
    clearTimeout(this.timer);
  }

  /**
   * Restructures displayed read notifications vis-a-vis unread notifications.
   */
  setNotifications() {
    const length = this.unreadNotifications.length;
    this.displayedReadNotifications = length < 9 ? this.readNotifications.slice(0, 9 - length) : [];
  }

  /**
   * Recursively fetch unread notifications.
   */
  fetchUnreadNotifications() {
    this.notificationsService.getNotifications(false).subscribe((response: any) => {
      this.unreadNotifications = this.unreadNotifications.concat(response.pageItems);
      this.setNotifications();
    });
    // this.mockNotifications(); // Uncomment for Testing.
    this.timer = setTimeout(() => { this.fetchUnreadNotifications(); }, 60000);
  }

  /**
   * Update read/unread notifications.
   */
  menuClosed() {
    // Update the server for read notifications.
    this.notificationsService.updateNotifications().subscribe(() => {});
    // Update locally for read notifications.
    this.readNotifications = this.unreadNotifications.concat(this.readNotifications);
    this.unreadNotifications = [];
    this.setNotifications();
  }

  /**
   * Function to test notifications in case of faulty backend.
   */
  mockNotifications() {
    this.notificationsService.getMockUnreadNotification().subscribe((response: any) => {
      this.unreadNotifications = this.unreadNotifications.concat(response.pageItems);
      this.setNotifications();
    });
  }

}
