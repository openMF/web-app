#!/usr/bin/env node

/**
 * Copyright since 2025 Mifos Initiative
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

const fs = require('fs');
const path = require('path');

const HEADING = '## Playwright E2E — flaky tests';
const MAX_ERROR_LENGTH = 160;

function collectFlakyTests(report) {
  const flaky = [];
  const visit = (suite, titles) => {
    for (const spec of suite.specs) {
      for (const test of spec.tests) {
        // Playwright's own outcome for "failed at least once, then passed on a retry".
        if (test.status === 'flaky') {
          flaky.push({ spec, titles: [...titles, spec.title], test });
        }
      }
    }
    for (const child of suite.suites ?? []) {
      visit(child, [...titles, child.title]);
    }
  };
  // Top-level suites are files, and their title is the path, which is rendered separately.
  for (const fileSuite of report.suites) {
    visit(fileSuite, []);
  }
  return flaky;
}

function repoPath(rootDir, file) {
  return path.relative(process.cwd(), path.resolve(rootDir, file)).split(path.sep).join('/');
}

function firstFailureMessage(results) {
  const failed = results.find((result) => result.status !== 'passed' && result.status !== 'skipped');
  const message = failed?.errors?.[0]?.message ?? failed?.error?.message ?? '';
  const firstLine =
    message
      .replace(/\u001b\[[0-9;]*m/g, '')
      .split('\n')
      .map((line) => line.trim())
      .find(Boolean) ?? '';
  return firstLine.length > MAX_ERROR_LENGTH ? `${firstLine.slice(0, MAX_ERROR_LENGTH - 1)}…` : firstLine;
}

function escapeCell(text) {
  return text.replace(/\r?\n/g, ' ').replace(/\|/g, '\\|').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

function renderSummary(report) {
  const { expected, unexpected, flaky, skipped } = report.stats;
  const lines = [HEADING, '', `**${flaky} flaky** · ${expected} passed · ${unexpected} failed · ${skipped} skipped`];
  const flakyTests = collectFlakyTests(report);
  if (flakyTests.length > 0) {
    lines.push(
      '',
      'Each of these failed at least once and then passed on a retry, so the run did not fail.',
      '',
      '| Test | Project | Attempts | First failure |',
      '| --- | --- | --- | --- |'
    );
    for (const { spec, titles, test } of flakyTests) {
      const location = `\`${repoPath(report.config.rootDir, spec.file)}:${spec.line}\``;
      const name = escapeCell(titles.join(' › '));
      const error = escapeCell(firstFailureMessage(test.results));
      lines.push(`| ${location} › ${name} | ${escapeCell(test.projectName)} | ${test.results.length} | ${error} |`);
    }
  }
  return `${lines.join('\n')}\n`;
}

const reportPath = process.argv[2];
if (!reportPath) {
  console.error('Usage: node scripts/summarize-flaky-tests.js <playwright-json-report>');
  process.exit(1);
}

const summary = fs.existsSync(reportPath)
  ? renderSummary(JSON.parse(fs.readFileSync(reportPath, 'utf8')))
  : `${HEADING}\n\nNo JSON report at \`${reportPath}\`: the test step did not run to completion.\n`;

if (process.env.GITHUB_STEP_SUMMARY) {
  fs.appendFileSync(process.env.GITHUB_STEP_SUMMARY, summary);
} else {
  process.stdout.write(summary);
}
