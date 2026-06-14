/**
 * Copyright since 2025 Mifos Initiative
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

/** MCP tools that perform write operations and require confirmation. */
export const WRITE_TOOLS = [
  'approve_and_disburse_loan',
  'create_client',
  'create_loan',
  'record_repayment'
];

/**
 * Maps a user role to the set of MCP tools it may invoke.
 * Pure logic, see permission-checker.spec.ts.
 */
export class PermissionChecker {
  /** Returns the tool names allowed for the given role. */
  allowedTools(_role: string): string[] {
    // TODO: define role -> tool mapping.
    throw new Error('Not implemented');
  }

  /** True if the role may invoke the named tool. */
  canUseTool(_role: string, _toolName: string): boolean {
    // TODO: check membership against allowedTools.
    throw new Error('Not implemented');
  }

  /** True if the tool mutates data and therefore needs a confirmation dialog. */
  isWriteTool(toolName: string): boolean {
    return WRITE_TOOLS.includes(toolName);
  }
}
