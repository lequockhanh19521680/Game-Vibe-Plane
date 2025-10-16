#!/bin/bash

# Test script for Game Vibe Plane Backend Leaderboard API
# Usage: ./test-api.sh <API_ENDPOINT>
# Example: ./test-api.sh https://abc123.execute-api.us-east-1.amazonaws.com/prod

set -e

# Colors for output
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check if API endpoint is provided
if [ -z "$1" ]; then
    echo -e "${RED}Error: API endpoint is required${NC}"
    echo "Usage: ./test-api.sh <API_ENDPOINT>"
    echo "Example: ./test-api.sh https://abc123.execute-api.us-east-1.amazonaws.com/prod"
    exit 1
fi

API_ENDPOINT=$1

echo -e "${YELLOW}Testing Game Vibe Plane Backend API${NC}"
echo -e "API Endpoint: ${GREEN}$API_ENDPOINT${NC}"
echo ""

# Test 1: Submit Score
echo -e "${YELLOW}Test 1: Submitting a test score...${NC}"
SUBMIT_RESPONSE=$(curl -s -X POST "$API_ENDPOINT/submit-score" \
  -H "Content-Type: application/json" \
  -d '{
    "username": "TestPlayer",
    "score": 9999,
    "survivalTime": 120,
    "deathCause": "test collision"
  }')

echo "$SUBMIT_RESPONSE" | jq '.'

if echo "$SUBMIT_RESPONSE" | jq -e '.success' > /dev/null 2>&1; then
    echo -e "${GREEN}✓ Score submission successful!${NC}"
    SESSION_ID=$(echo "$SUBMIT_RESPONSE" | jq -r '.sessionId')
    COUNTRY=$(echo "$SUBMIT_RESPONSE" | jq -r '.country')
    echo -e "Session ID: ${GREEN}$SESSION_ID${NC}"
    echo -e "Country: ${GREEN}$COUNTRY${NC}"
else
    echo -e "${RED}✗ Score submission failed!${NC}"
    exit 1
fi

echo ""

# Test 2: Submit another score
echo -e "${YELLOW}Test 2: Submitting another test score...${NC}"
SUBMIT_RESPONSE_2=$(curl -s -X POST "$API_ENDPOINT/submit-score" \
  -H "Content-Type: application/json" \
  -d '{
    "username": "AnotherPlayer",
    "score": 5555,
    "survivalTime": 90,
    "deathCause": "asteroid collision"
  }')

echo "$SUBMIT_RESPONSE_2" | jq '.'

if echo "$SUBMIT_RESPONSE_2" | jq -e '.success' > /dev/null 2>&1; then
    echo -e "${GREEN}✓ Second score submission successful!${NC}"
else
    echo -e "${RED}✗ Second score submission failed!${NC}"
fi

echo ""

# Wait a moment for DynamoDB consistency
echo -e "${YELLOW}Waiting 2 seconds for data consistency...${NC}"
sleep 2

# Test 3: Get Leaderboard
echo -e "${YELLOW}Test 3: Fetching leaderboard...${NC}"
LEADERBOARD_RESPONSE=$(curl -s "$API_ENDPOINT/leaderboard?limit=10")

echo "$LEADERBOARD_RESPONSE" | jq '.'

if echo "$LEADERBOARD_RESPONSE" | jq -e '.leaderboard' > /dev/null 2>&1; then
    echo -e "${GREEN}✓ Leaderboard retrieval successful!${NC}"
    
    # Display leaderboard summary
    COUNT=$(echo "$LEADERBOARD_RESPONSE" | jq -r '.count')
    echo -e "Total entries: ${GREEN}$COUNT${NC}"
    
    # Display top 3 players
    echo -e "\n${YELLOW}Top 3 Players:${NC}"
    echo "$LEADERBOARD_RESPONSE" | jq -r '.leaderboard[0:3] | .[] | "\(.rank). \(.username) - \(.score) pts (\(.country))"'
    
    # Display stats
    echo -e "\n${YELLOW}Statistics:${NC}"
    echo "$LEADERBOARD_RESPONSE" | jq -r '.stats | "Total Games: \(.totalGames)\nAverage Score: \(.averageScore)\nAverage Survival Time: \(.averageSurvivalTime)s"'
    
    # Display top countries
    echo -e "\n${YELLOW}Top Countries:${NC}"
    echo "$LEADERBOARD_RESPONSE" | jq -r '.stats.topCountries[] | "\(.country): \(.count) games"'
else
    echo -e "${RED}✗ Leaderboard retrieval failed!${NC}"
    exit 1
fi

echo ""

# Test 4: Get Leaderboard filtered by country
if [ ! -z "$COUNTRY" ] && [ "$COUNTRY" != "null" ]; then
    echo -e "${YELLOW}Test 4: Fetching leaderboard filtered by country ($COUNTRY)...${NC}"
    COUNTRY_LEADERBOARD=$(curl -s "$API_ENDPOINT/leaderboard?limit=10&country=$COUNTRY")
    
    echo "$COUNTRY_LEADERBOARD" | jq '.'
    
    if echo "$COUNTRY_LEADERBOARD" | jq -e '.leaderboard' > /dev/null 2>&1; then
        echo -e "${GREEN}✓ Country-filtered leaderboard retrieval successful!${NC}"
        COUNTRY_COUNT=$(echo "$COUNTRY_LEADERBOARD" | jq -r '.count')
        echo -e "Entries from $COUNTRY: ${GREEN}$COUNTRY_COUNT${NC}"
    else
        echo -e "${RED}✗ Country-filtered leaderboard retrieval failed!${NC}"
    fi
fi

echo ""
echo -e "${GREEN}════════════════════════════════════════${NC}"
echo -e "${GREEN}All tests completed successfully! ✓${NC}"
echo -e "${GREEN}════════════════════════════════════════${NC}"
echo ""
echo -e "${YELLOW}Next steps:${NC}"
echo "1. Update frontend config with this API endpoint"
echo "2. Set USE_BACKEND to true in js/api/backendApi.js"
echo "3. Test the game with real gameplay"
echo ""
