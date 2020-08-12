/** Angular Imports */
import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';

/** rxjs Imports */
import { Observable } from 'rxjs';

/**
 * Groups service.
 */
@Injectable({
    providedIn: 'root'
})
export class GroupsService {

  /**
   * @param {HttpClient} http Http Client to send requests.
   */
  constructor(private http: HttpClient) { }

  /**
   * @param {any} filterBy Properties by which entries should be filtered.
   * @param {string} orderBy Property by which entries should be sorted.
   * @param {string} sortOrder Sort order: ascending or descending.
   * @param {number} offset Page offset.
   * @param {number} limit Number of entries within the page.
   * @returns {Observable<any>} Groups.
   */
  getGroups(filterBy: any, orderBy: string, sortOrder: string, offset?: number, limit?: number): Observable<any> {
    let httpParams = new HttpParams()
      .set('offset', offset.toString())
      .set('limit', limit.toString())
      .set('sortOrder', sortOrder)
      .set('orderBy', orderBy)
      .set('paged', 'true');
    // filterBy: name
    filterBy.forEach(function (filter: any) {
      if (filter.value) {
        httpParams = httpParams.set(filter.type, filter.value);
      }
    });
    return this.http.get('/groups', { params: httpParams });
  }

  /**
   * @param {string} orderBy Property by which entries should be sorted.
   * @param {string} sortOrder Sort order: ascending or descending.
   * @param {string} name Filter value for groups names.
   * @param {any} officeId? Office Id.
   * @param {any} orphansOnly? Orphans Only.
   * @returns {Observable<any>} Groups.
   */
  getFilteredGroups(orderBy: string, sortOrder: string, name: string, officeId?: any, orphansOnly?: any): Observable<any> {
    let httpParams = new HttpParams()
      .set('name', name)
      .set('sortOrder', sortOrder)
      .set('orderBy', orderBy);
    if (officeId) {
      httpParams = httpParams.set('officeId', officeId);
    }
    httpParams = orphansOnly ? httpParams.set('orphansOnly', orphansOnly) : httpParams;
    return this.http.get('/groups', { params: httpParams });
  }

  /**
   * @param {number} officeId Office Id of office to get groups for.
   * @returns {Observable<any>}
   */
  getGroupsByOfficeId(officeId: number): Observable<any> {
    const httpParams = new HttpParams().set('officeId', officeId.toString());
    return this.http.get('/groups', { params: httpParams } );
  }

  /**
   * @param {string} groupId Group Id of group to get data for.
   * @param {string} template? Is template data required.
   * @returns {Observable<any>} Group data.
   */
  getGroupData(groupId: string, template?: string): Observable<any> {
    let httpParams = new HttpParams().set('associations', 'all');
    httpParams = template ? httpParams.set('template', template) : httpParams;
    return this.http.get(`/groups/${groupId}`, { params: httpParams });
  }

  /**
   * @param groupId Group Id of group to get data for.
   * @returns {Observable<any>} Group Summary data.
   */
  getGroupSummary(groupId: string): Observable<any> {
    const httpParams = new HttpParams().set('R_groupId', groupId)
      .set('genericResultSet', 'false');
    return this.http.get(`/runreports/GroupSummaryCounts`, { params: httpParams });
  }

  /**
   * @param groupId Group Id of group to get data for.
   * @returns {Observable<any>} Group Accounts data.
   */
  getGroupAccountsData(groupId: string): Observable<any> {
    return this.http.get(`/groups/${groupId}/accounts`);
  }

  /**
   * @param groupId Group Id of group to get data for.
   * @returns {Observable<any>} Group Notes data.
   */
  getGroupNotes(groupId: string): Observable<any> {
    return this.http.get(`/groups/${groupId}/notes`);
  }

  /**
   * @param groupId Group Id of group to create note for.
   * @param noteData Note Data.
   * @returns {Observable<any>}
   */
  createGroupNote(groupId: string, noteData: any): Observable<any> {
    return this.http.post(`/groups/${groupId}/notes`, noteData);
  }

  /**
   * @param groupId Group Id of group to edit note for.
   * @param noteId Note Id
   * @param noteData Note Data
   * @returns {Observable<any>}
   */
  editGroupNote(groupId: string, noteId: string, noteData: any): Observable<any> {
    return this.http.put(`/groups/${groupId}/notes/${noteId}`, noteData);
  }

  /**
   * @param groupId Group Id of group to delete note for.
   * @param noteId Note Id
   * @returns {Observable<any>}
   */
  deleteGroupNote(groupId: string, noteId: string): Observable<any> {
    return this.http.delete(`/groups/${groupId}/notes/${noteId}`);
  }

  /**
   * @returns {Observable<any>}
   */
  getGroupDatatables(): Observable<any> {
    const httpParams = new HttpParams().set('apptable', 'm_group');
    return this.http.get(`/datatables`, { params: httpParams });
  }

  /**
   * @param groupId Group Id of group to get datatable for.
   * @param datatableName Data table name.
   * @returns {Observable<any>}
   */
  getGroupDatatable(groupId: string, datatableName: string): Observable<any> {
    const httpParams = new HttpParams().set('genericResultSet', 'true');
    return this.http.get(`/datatables/${datatableName}/${groupId}`, { params: httpParams });
  }

  /**
   * @param groupId Group Id of group to get add datatable entry for.
   * @param datatableName Data Table name.
   * @param data Data.
   * @returns {Observable<any>}
   */
  addGroupDatatableEntry(groupId: string, datatableName: string, data: any): Observable<any> {
    const httpParams = new HttpParams().set('genericResultSet', 'true');
    return this.http.post(`/datatables/${datatableName}/${groupId}`, data, { params: httpParams });
  }

  /**
   * @param groupId Group Id of group to get add datatable entry for.
   * @param datatableName Data Table name.
   * @param data Data.
   * @returns {Observable<any>}
   */
  editGroupDatatableEntry(groupId: string, datatableName: string, data: any): Observable<any> {
    const httpParams = new HttpParams().set('genericResultSet', 'true');
    return this.http.put(`/datatables/${datatableName}/${groupId}`, data, { params: httpParams });
  }

  /**
   * @param groupId Group Id of group to get add datatable entry for.
   * @param datatableName Data Table name.
   * @returns {Observable<any>}
   */
  deleteDatatableContent(groupId: string, datatableName: string): Observable<any> {
    const httpParams = new HttpParams().set('genericResultSet', 'true');
    return this.http.delete(`/datatables/${datatableName}/${groupId}`, { params: httpParams });
  }

  /**
   * @param {any} command Command
   * @returns {Observable<any>} Group Command Template
   */
  getGroupCommandTemplate(command: string): Observable<any> {
    const httpParams = new HttpParams().set('command', command);
    return this.http.get(`/groups/template`, { params: httpParams });
  }

  /**
   * @param {string} groupId Group Id
   * @param {string} command Command
   * @param {any} data Command payload
   * @returns {Observable<any>}
   */
  executeGroupCommand(groupId: string, command: string, data: any): Observable<any> {
    const httpParams = new HttpParams().set('command', command);
    return this.http.post(`/groups/${groupId}`, data, { params: httpParams });
  }

  /**
   * @param {string} groupId Group Id
   * @param {any} roleId Role Id
   * @returns {Observable<any>}
   */
  unAssignRoleCommand(groupId: string, roleId: any): Observable<any> {
    const httpParams = new HttpParams()
        .set('command', 'unassignRole')
        .set('roleId', roleId);
    return this.http.post(`/groups/${groupId}`, {}, { params: httpParams });
  }

  /**
   * @param {any} group Group to be created.
   * @returns {Observable<any>}
   */
  createGroup(group: any): Observable<any> {
    return this.http.post('/groups', group);
  }

  /**
   * @param {any} group Group to be updated.
   * @param {any} groupId Group Id
   * @returns {Observable<any>}
   */
  updateGroup(group: any, groupId: any): Observable<any> {
    return this.http.put(`/groups/${groupId}`, group);
  }

  /**
   * @param {string} groupId group Id
   * @returns {Observable<any>}
   */
  deleteGroup(groupId: string): Observable<any> {
    return this.http.delete(`/groups/${groupId}`);
  }

  /**
   * @param {any} groupId Group Id
   * @returns {Observable<any>}
   */
  getGroupCalendarTemplate(groupId: any): Observable<any> {
    return this.http.get(`/groups/${groupId}/calendars/template`);
  }

  /**
   * @param {any} groupId Group Id
   * @param {any} calendarId Calendar Id
   * @returns {Observable<any>}
   */
  getGroupCalendarAndTemplate(groupId: any, calendarId: any): Observable<any> {
    const httpParams = new HttpParams().set('template', 'true');
    return this.http.get(`/groups/${groupId}/calendars/${calendarId}`, { params: httpParams });
  }

  /**
   * @param {any} groupId Group Id
   * @param {any} data Group meeting data
   * @returns {Observable<any>}
   */
  createGroupMeeting(groupId: any, data: any): Observable<any> {
    return this.http.post(`/groups/${groupId}/calendars`, data);
  }

  /**
   * @param {any} groupId Group Id
   * @param {any} data Meeting Data
   * @param {any} calendarId Calendar Id
   * @returns {Observable<any>}
   */
  updateGroupMeeting(groupId: any, data: any, calendarId: any): Observable<any> {
    return this.http.put(`/groups/${groupId}/calendars/${calendarId}`, data);
  }

  /**
   * @param {any} groupId Group Id
   * @param {any} calendarId Calendar Id
   * @returns {Observable<any>}
   */
  getMeetingsTemplate(groupId: any, calendarId: any): Observable<any> {
    const httpParams = new HttpParams().set('calenderId', calendarId);
    return this.http.get(`/groups/${groupId}/meetings/template`, { params: httpParams });
  }

  /**
   * @param {any} groupId Group Id
   * @param {any} calendarId Calendar Id
   * @param {any} data Attendance Data
   * @returns {Observable<any>}
   */
  assignGroupAttendance(groupId: any, calendarId: any, data: any): Observable<any> {
    const httpParams = new HttpParams().set('calenderId', calendarId);
    return this.http.post(`/groups/${groupId}/meetings`, data, { params: httpParams });
  }

  /**
   * @param {number} id Office Id of office to get staff for.
   * @returns {Observable<any>} Staff Data for group.
   */
  getStaff(id: number): Observable<any> {
    const httpParams = new HttpParams()
        .set('officeId', id.toString())
        .set('staffInSelectedOfficeOnly', 'true');
    return this.http.get('/groups/template', { params: httpParams });
  }

}
