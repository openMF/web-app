#!/bin/bash

BRANCH_NAME="$(git rev-parse --abbrev-ref HEAD)"
COMMIT_NAME="$(git rev-parse --verify HEAD)"

# Define default values for missing variables

MIFOS_TEST_SUITE_ID="BqnXhRcaZ59ADvxHo"
MIFOS_AUTH_TOKEN="c3903536-0371-4ba3-afeb-69cf9b408ca6"
LOCALHOST_URL="http://localhost:4200"

# Paths for the test cases and rules files
TEST_CASES_PATH="e2e/testRigor/testcases/**/*.txt"
RULES_PATH="e2e/testRigor/rules/**/*.txt"

curl -I $LOCALHOST_URL:4200

# Command to run the tests using the testRigor CLI
testrigor test-suite run "$MIFOS_TEST_SUITE_ID" --token "$MIFOS_AUTH_TOKEN" --localhost --url "$LOCALHOST_URL" --test-cases-path "$TEST_CASES_PATH" --rules-path "$RULES_PATH" --branch "$BRANCH_NAME" --commit "$COMMIT_NAME"