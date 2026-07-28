/**
 * Copyright since 2025 Mifos Initiative
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

/**
 * High-impact write tools that always require a confirmation dialog. This is an
 * explicit allow-list of the most sensitive operations; broader detection is
 * handled by WRITE_VERB so the gate covers all ~100 MCP tools, not just these.
 */
export const WRITE_TOOLS = [
  'approve_and_disburse_loan',
  'disburse_loan',
  'create_loan',
  'create_client',
  'record_repayment',
  'reject_loan',
  'withdraw_loan',
  'close_loan',
  'transfer_funds'
];

/**
 * Verb prefixes that mark a tool as mutating. The Mifos MCP server exposes ~100
 * tools; rather than enumerate them all, any tool whose name starts with one of
 * these verbs is treated as a write (defense in depth alongside WRITE_TOOLS).
 */
const WRITE_VERB =
  /^(create|update|delete|remove|add|edit|modify|approve|reject|withdraw|disburse|undo|activate|deactivate|close|reopen|assign|unassign|transfer|record|make|pay|post|submit|reschedule|writeoff|write_off|waive|charge|apply|cancel|block|unblock|freeze)[_-]/i;

/** Roles allowed to perform write operations. Everyone may read. */
const WRITE_ROLES = new Set([
  'super_user',
  'admin',
  'administrator',
  'branch_manager',
  'loan_officer'
]);

/** Roles explicitly restricted to read-only, even if otherwise matched. */
const READ_ONLY_ROLES = new Set([
  'field_agent',
  'auditor',
  'read_only',
  'viewer',
  'self_service_user'
]);

/**
 * Client-side permission gate for MCP tool calls. Read tools are allowed for any
 * authenticated user; write tools are restricted by role. This is a first-line
 * guard only: Fineract still enforces its own RBAC server-side on every call.
 * Pure logic, no Angular dependency; see permission-checker.spec.ts.
 */
export class PermissionChecker {
  /** True if the tool mutates data and therefore needs a confirmation dialog. */
  isWriteTool(toolName: string): boolean {
    const name = (toolName ?? '').trim();
    if (!name) {
      return false;
    }
    return WRITE_TOOLS.includes(name) || WRITE_VERB.test(name);
  }

  /** True if the role may perform write operations at all. */
  canWrite(role: string): boolean {
    const key = this.normalize(role);
    if (READ_ONLY_ROLES.has(key)) {
      return false;
    }
    return WRITE_ROLES.has(key);
  }

  /** True if the role may invoke the named tool (reads: always; writes: role-gated). */
  canUseTool(role: string, toolName: string): boolean {
    if (!this.isWriteTool(toolName)) {
      return true;
    }
    return this.canWrite(role);
  }

  /** Filters a list of tool names to those the role may invoke. */
  allowedTools(role: string, toolNames: string[]): string[] {
    return (toolNames ?? []).filter((tool) => this.canUseTool(role, tool));
  }

  /** Normalize a display role ("Loan Officer") to a key ("loan_officer"). */
  private normalize(role: string): string {
    return (role ?? '').trim().toLowerCase().replace(/\s+/g, '_');
  }
}
