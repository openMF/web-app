/**
 * Copyright since 2025 Mifos Initiative
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { describe, it, expect, beforeEach } from '@jest/globals';
import { PermissionChecker } from './permission-checker';

describe('PermissionChecker', () => {
  let checker: PermissionChecker;

  beforeEach(() => {
    checker = new PermissionChecker();
  });

  describe('isWriteTool', () => {
    it('flags explicit high-impact write tools', () => {
      expect(checker.isWriteTool('approve_and_disburse_loan')).toBe(true);
      expect(checker.isWriteTool('record_repayment')).toBe(true);
    });

    it('flags any tool with a mutating verb prefix (covers all MCP tools)', () => {
      for (const tool of [
        'create_savings_account',
        'update_client',
        'delete_charge',
        'disburse_loan',
        'reject_loan',
        'transfer_funds',
        'waive_charge',
        'reschedule_loan'
      ]) {
        expect(checker.isWriteTool(tool)).toBe(true);
      }
    });

    it('treats read/query tools as non-write', () => {
      for (const tool of [
        'search_clients',
        'get_loan',
        'list_savings',
        'view_client',
        'fetch_repayment_schedule'
      ]) {
        expect(checker.isWriteTool(tool)).toBe(false);
      }
      expect(checker.isWriteTool('')).toBe(false);
    });
  });

  describe('canUseTool', () => {
    it('allows read tools for every role, including unknown', () => {
      expect(checker.canUseTool('field_agent', 'search_clients')).toBe(true);
      expect(checker.canUseTool('auditor', 'get_loan')).toBe(true);
      expect(checker.canUseTool('whoever', 'list_savings')).toBe(true);
    });

    it('blocks a field_agent and auditor from any write', () => {
      expect(checker.canUseTool('field_agent', 'approve_and_disburse_loan')).toBe(false);
      expect(checker.canUseTool('auditor', 'create_client')).toBe(false);
    });

    it('lets branch_manager and loan_officer perform writes (incl. approving loans)', () => {
      expect(checker.canUseTool('branch_manager', 'approve_and_disburse_loan')).toBe(true);
      expect(checker.canUseTool('loan_officer', 'approve_and_disburse_loan')).toBe(true);
      expect(checker.canUseTool('loan_officer', 'disburse_loan')).toBe(true);
    });

    it('normalizes display role names', () => {
      expect(checker.canUseTool('Branch Manager', 'create_loan')).toBe(true);
      expect(checker.canUseTool('Field Agent', 'record_repayment')).toBe(false);
    });

    it('denies writes for an unknown or empty role (safe default)', () => {
      expect(checker.canUseTool('', 'record_repayment')).toBe(false);
      expect(checker.canUseTool('ghost', 'create_loan')).toBe(false);
    });
  });

  describe('allowedTools', () => {
    it('filters a tool list to those the role may invoke', () => {
      const tools = [
        'search_clients',
        'approve_and_disburse_loan',
        'get_loan',
        'create_client'
      ];
      expect(checker.allowedTools('field_agent', tools)).toEqual([
        'search_clients',
        'get_loan'
      ]);
      expect(checker.allowedTools('loan_officer', tools)).toEqual(tools);
    });
  });
});
