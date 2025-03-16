#!/bin/bash
set -x
env

BRANCH_NAME="$(git rev-parse --abbrev-ref HEAD)"
COMMIT_NAME="$(git rev-parse --verify HEAD)"

# Define default values for missing variables

# MIFOS_TEST_SUITE_ID="$MIFOS_TEST_SUITE_ID"
# MIFOS_AUTH_TOKEN="$MIFOS_AUTH_TOKEN"
# LOCALHOST_URL="$MIFOS_LOCALHOST_URL"

# Paths for the test cases and rules files
TEST_CASES_PATH="e2e/testRigor/testcases/**/*.txt"
RULES_PATH="e2e/testRigor/rules/**/*.txt"

# Command to run the tests using the testRigor CLI
testrigor test-suite run "$MIFOS_TEST_SUITE_ID" --token "$MIFOS_AUTH_TOKEN" --localhost --url "$LOCALHOST_URL" --test-cases-path "$TEST_CASES_PATH" --rules-path "$RULES_PATH" --branch "$BRANCH_NAME" --commit "$COMMIT_NAME"
set +x