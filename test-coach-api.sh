#!/bin/bash
# Test script for Coach Assignment API Endpoints
# Usage: source this file and run the test functions
# Requirements: curl, jq (optional, for pretty-printing JSON)

# Configuration
API_URL="${API_URL:-http://localhost:3000}"
TOKEN="${TOKEN:-}"
TEAM_ID="${TEAM_ID:-}"
COACH_ID="${COACH_ID:-}"

# Color output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Helper function to print test results
test_result() {
  local test_name="$1"
  local status="$2"
  local response="$3"
  
  if [ "$status" -eq 0 ]; then
    echo -e "${GREEN}✓ PASS${NC}: $test_name"
  else
    echo -e "${RED}✗ FAIL${NC}: $test_name"
  fi
  
  if [ -n "$response" ]; then
    echo "Response: $response"
  fi
  echo ""
}

# Test 1: List all coaches
test_list_coaches() {
  echo -e "${YELLOW}Test 1: GET /api/coaches${NC}"
  
  if [ -z "$TOKEN" ]; then
    echo -e "${RED}✗ SKIP${NC}: No TOKEN provided"
    return 1
  fi
  
  response=$(curl -s -X GET \
    -H "Authorization: Bearer $TOKEN" \
    "$API_URL/api/coaches")
  
  if echo "$response" | grep -q '"success":true'; then
    test_result "List coaches" 0 "$(echo $response | jq . 2>/dev/null || echo $response)"
    return 0
  else
    test_result "List coaches" 1 "$(echo $response | jq . 2>/dev/null || echo $response)"
    return 1
  fi
}

# Test 2: List available coaches only
test_list_available_coaches() {
  echo -e "${YELLOW}Test 2: GET /api/coaches?available_only=true${NC}"
  
  if [ -z "$TOKEN" ]; then
    echo -e "${RED}✗ SKIP${NC}: No TOKEN provided"
    return 1
  fi
  
  response=$(curl -s -X GET \
    -H "Authorization: Bearer $TOKEN" \
    "$API_URL/api/coaches?available_only=true")
  
  if echo "$response" | grep -q '"success":true'; then
    test_result "List available coaches" 0 "$(echo $response | jq . 2>/dev/null || echo $response)"
    return 0
  else
    test_result "List available coaches" 1 "$(echo $response | jq . 2>/dev/null || echo $response)"
    return 1
  fi
}

# Test 3: Assign coach to team
test_assign_coach() {
  echo -e "${YELLOW}Test 3: PATCH /api/teams/:teamId/coach${NC}"
  
  if [ -z "$TOKEN" ] || [ -z "$TEAM_ID" ] || [ -z "$COACH_ID" ]; then
    echo -e "${RED}✗ SKIP${NC}: Missing TOKEN, TEAM_ID, or COACH_ID"
    return 1
  fi
  
  response=$(curl -s -X PATCH \
    -H "Authorization: Bearer $TOKEN" \
    -H "Content-Type: application/json" \
    -d "{\"coach_id\":\"$COACH_ID\"}" \
    "$API_URL/api/teams/$TEAM_ID/coach")
  
  if echo "$response" | grep -q '"success":true'; then
    test_result "Assign coach to team" 0 "$(echo $response | jq . 2>/dev/null || echo $response)"
    return 0
  else
    test_result "Assign coach to team" 1 "$(echo $response | jq . 2>/dev/null || echo $response)"
    return 1
  fi
}

# Test 4: Unassign coach from team
test_unassign_coach() {
  echo -e "${YELLOW}Test 4: PATCH /api/teams/:teamId/coach (with null coach_id)${NC}"
  
  if [ -z "$TOKEN" ] || [ -z "$TEAM_ID" ]; then
    echo -e "${RED}✗ SKIP${NC}: Missing TOKEN or TEAM_ID"
    return 1
  fi
  
  response=$(curl -s -X PATCH \
    -H "Authorization: Bearer $TOKEN" \
    -H "Content-Type: application/json" \
    -d '{"coach_id":null}' \
    "$API_URL/api/teams/$TEAM_ID/coach")
  
  if echo "$response" | grep -q '"success":true'; then
    test_result "Unassign coach from team" 0 "$(echo $response | jq . 2>/dev/null || echo $response)"
    return 0
  else
    test_result "Unassign coach from team" 1 "$(echo $response | jq . 2>/dev/null || echo $response)"
    return 1
  fi
}

# Test 5: Remove coach from team (DELETE method)
test_remove_coach() {
  echo -e "${YELLOW}Test 5: DELETE /api/teams/:teamId/coach${NC}"
  
  if [ -z "$TOKEN" ] || [ -z "$TEAM_ID" ]; then
    echo -e "${RED}✗ SKIP${NC}: Missing TOKEN or TEAM_ID"
    return 1
  fi
  
  response=$(curl -s -X DELETE \
    -H "Authorization: Bearer $TOKEN" \
    "$API_URL/api/teams/$TEAM_ID/coach")
  
  if echo "$response" | grep -q '"success":true'; then
    test_result "Remove coach from team" 0 "$(echo $response | jq . 2>/dev/null || echo $response)"
    return 0
  else
    test_result "Remove coach from team" 1 "$(echo $response | jq . 2>/dev/null || echo $response)"
    return 1
  fi
}

# Test 6: Test auth failure
test_no_auth() {
  echo -e "${YELLOW}Test 6: GET /api/coaches (without auth)${NC}"
  
  response=$(curl -s -X GET "$API_URL/api/coaches")
  
  if echo "$response" | grep -q '"success":false'; then
    test_result "No auth rejection" 0 "$(echo $response | jq . 2>/dev/null || echo $response)"
    return 0
  else
    test_result "No auth rejection" 1 "$(echo $response | jq . 2>/dev/null || echo $response)"
    return 1
  fi
}

# Test 7: Test invalid UUID
test_invalid_uuid() {
  echo -e "${YELLOW}Test 7: PATCH /api/teams/invalid-uuid/coach${NC}"
  
  if [ -z "$TOKEN" ]; then
    echo -e "${RED}✗ SKIP${NC}: No TOKEN provided"
    return 1
  fi
  
  response=$(curl -s -X PATCH \
    -H "Authorization: Bearer $TOKEN" \
    -H "Content-Type: application/json" \
    -d '{"coach_id":"not-a-uuid"}' \
    "$API_URL/api/teams/invalid-uuid/coach")
  
  if echo "$response" | grep -q '"success":false'; then
    test_result "Invalid UUID rejection" 0 "$(echo $response | jq . 2>/dev/null || echo $response)"
    return 0
  else
    test_result "Invalid UUID rejection" 1 "$(echo $response | jq . 2>/dev/null || echo $response)"
    return 1
  fi
}

# Run all tests
run_all_tests() {
  echo -e "${YELLOW}================================${NC}"
  echo -e "${YELLOW}Coach Assignment API Test Suite${NC}"
  echo -e "${YELLOW}================================${NC}"
  echo ""
  
  if [ -z "$TOKEN" ]; then
    echo -e "${RED}Warning: TOKEN not set. Set it with: export TOKEN=your_token${NC}"
    echo ""
  fi
  
  if [ -z "$TEAM_ID" ]; then
    echo -e "${RED}Warning: TEAM_ID not set. Set it with: export TEAM_ID=your_team_id${NC}"
    echo ""
  fi
  
  if [ -z "$COACH_ID" ]; then
    echo -e "${RED}Warning: COACH_ID not set. Set it with: export COACH_ID=your_coach_id${NC}"
    echo ""
  fi
  
  test_no_auth
  test_list_coaches
  test_list_available_coaches
  test_invalid_uuid
  
  if [ -n "$TEAM_ID" ] && [ -n "$COACH_ID" ]; then
    test_assign_coach
    test_unassign_coach
    test_remove_coach
  fi
  
  echo -e "${YELLOW}================================${NC}"
  echo -e "${YELLOW}Tests Complete${NC}"
  echo -e "${YELLOW}================================${NC}"
}

# Usage instructions
show_usage() {
  cat << EOF
Usage: source this file and run test functions

Configuration (set these before running tests):
  export API_URL="http://localhost:3000"
  export TOKEN="your_supabase_access_token"
  export TEAM_ID="team_uuid_for_testing"
  export COACH_ID="coach_uuid_for_testing"

Functions:
  run_all_tests          - Run all tests
  test_list_coaches      - Test GET /api/coaches
  test_list_available_coaches - Test GET /api/coaches?available_only=true
  test_assign_coach      - Test PATCH /api/teams/:teamId/coach
  test_unassign_coach    - Test PATCH with null coach_id
  test_remove_coach      - Test DELETE /api/teams/:teamId/coach
  test_no_auth          - Test auth failure
  test_invalid_uuid     - Test invalid UUID handling

Example:
  export API_URL="http://localhost:3000"
  export TOKEN="eyJhbGc..."
  export TEAM_ID="550e8400-e29b-41d4-a716-446655440000"
  export COACH_ID="550e8400-e29b-41d4-a716-446655440111"
  run_all_tests
EOF
}

# Display usage on sourcing
echo "Coach Assignment API Test Script loaded"
echo "Run 'show_usage' for instructions, or 'run_all_tests' to begin testing"
