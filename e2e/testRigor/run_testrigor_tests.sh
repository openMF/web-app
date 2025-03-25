#!/bin/bash

# Contributor: In order to test locally, please define default values if variables are missing.

AUTH_TOKEN="auth-token: $MIFOS_AUTH_TOKEN"
REQ_URL="https://api.testrigor.com/api/v1/apps/$MIFOS_TEST_SUITE_ID/status"

# Paths for the test cases and rules files
TEST_CASES_PATH="e2e/testRigor/testcases/**/*.txt"
RULES_PATH="e2e/testRigor/rules/**/*.txt"

# Command to run the tests using the testRigor CLI
response=$(testrigor test-suite run "$MIFOS_TEST_SUITE_ID" --token "$MIFOS_AUTH_TOKEN" --url "$LOCALHOST_URL" --test-cases-path "$TEST_CASES_PATH" --rules-path "$RULES_PATH" --explicit-mutations)

# Grab run ID from CLI log
RUN_ID=$(echo "$response" | sed -n "s|.*/test-suites/$MIFOS_TEST_SUITE_ID/runs/\([^ \"]*\).*|\1|p")

# Status for particular run
STATUS_URL="https://api2.testrigor.com/api/v1/apps/$MIFOS_TEST_SUITE_ID/runs/$RUN_ID/testcases"
RES=$(curl -s -X GET \
  -H "$AUTH_TOKEN" \
  "$STATUS_URL")

echo "$RES" | jq -r '
  "TOTAL: \(.data.totalElements)",
  "STATUS: \(if (.data.content | map(select(.status == "Failed")) | length > 0) then "Failed" else "Passed" end)",
  "TEST CASES:",
  (.data.content[] | "\(.name) \(if .status == "Passed" then "✓" else "✖" end)") 
' | awk -v total="$(echo "$RES" | jq '.data.totalElements')" '
BEGIN {
    print "\033[1mTEST RESULTS\033[0m"
    print "========================================"
    passed = 0
    failed = 0
}
NR==1 { 
    printf "\033[1m%-30s %s\033[0m\n", $0, sprintf("(%d total)", total)
    next 
}
NR==2 { 
    status_color=($2 == "Failed" ? "\033[31m" : "\033[32m")
    printf "\033[1m%-30s %s%s\033[0m\n", $1, status_color, $2
    next
}
NR==3 { print; next }
{
    if ($2 == "✓") {
        passed++
        gsub(/✓/, "\033[32m✓\033[0m")
    } else if ($2 == "✖") {
        failed++
        gsub(/✖/, "\033[31m✖\033[0m")
    }
    printf "  %-40s %s\n", $1, $2
}
END { 
    print "========================================"
    printf "\033[32m%d passing\033[0m  \033[31m%d failing\033[0m\n", passed, failed
}'
