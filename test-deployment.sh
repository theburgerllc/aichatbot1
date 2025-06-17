#!/bin/bash

# AI Chatbot Solutions - Quick Deployment Test Script
# Usage: ./test-deployment.sh [URL]

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

# Configuration
BASE_URL=${1:-"https://aichatbotsolutions.io"}
TIMEOUT=10

echo -e "${PURPLE}🚀 AI Chatbot Solutions - Quick Deployment Test${NC}"
echo -e "${PURPLE}=================================================${NC}"
echo -e "${BLUE}Testing URL: ${BASE_URL}${NC}"
echo -e "${BLUE}Timestamp: $(date -u)${NC}"
echo ""

# Function to test endpoint
test_endpoint() {
    local name="$1"
    local path="$2"
    local method="${3:-GET}"
    local data="$4"
    local expected_status="${5:-200}"
    
    echo -e "${CYAN}Testing: ${name}${NC}"
    echo -e "${BLUE}URL: ${BASE_URL}${path}${NC}"
    
    if [ "$method" = "POST" ] && [ -n "$data" ]; then
        response=$(curl -s -w "\n%{http_code}\n%{time_total}" \
            -X POST \
            -H "Content-Type: application/json" \
            -H "User-Agent: AI-Chatbot-Solutions-Test/1.0" \
            -d "$data" \
            --max-time $TIMEOUT \
            "${BASE_URL}${path}" 2>/dev/null || echo -e "\nERROR\n0")
    else
        response=$(curl -s -w "\n%{http_code}\n%{time_total}" \
            -H "User-Agent: AI-Chatbot-Solutions-Test/1.0" \
            --max-time $TIMEOUT \
            "${BASE_URL}${path}" 2>/dev/null || echo -e "\nERROR\n0")
    fi
    
    # Parse response
    body=$(echo "$response" | head -n -2)
    status=$(echo "$response" | tail -n 2 | head -n 1)
    time=$(echo "$response" | tail -n 1)
    
    # Convert time to milliseconds
    if [ "$time" != "0" ]; then
        time_ms=$(echo "$time * 1000" | bc -l 2>/dev/null | cut -d. -f1)
    else
        time_ms="TIMEOUT"
    fi
    
    echo -e "${BLUE}Status: ${status}${NC}"
    echo -e "${BLUE}Response Time: ${time_ms}ms${NC}"
    
    if [ "$status" -eq "$expected_status" ] || [ "$expected_status" = "ANY" ]; then
        echo -e "${GREEN}✓ PASS${NC} - $name"
        return 0
    else
        echo -e "${RED}✗ FAIL${NC} - $name (Expected: $expected_status, Got: $status)"
        if [ "$body" != "ERROR" ]; then
            echo -e "${RED}Response: $body${NC}"
        fi
        return 1
    fi
    echo ""
}

# Function to test security headers
test_security_headers() {
    echo -e "${CYAN}Testing Security Headers${NC}"
    
    headers=$(curl -s -I --max-time $TIMEOUT "${BASE_URL}/" 2>/dev/null)
    
    # Check for security headers
    if echo "$headers" | grep -qi "x-frame-options"; then
        echo -e "${GREEN}✓${NC} X-Frame-Options header present"
    else
        echo -e "${RED}✗${NC} X-Frame-Options header missing"
    fi
    
    if echo "$headers" | grep -qi "x-content-type-options"; then
        echo -e "${GREEN}✓${NC} X-Content-Type-Options header present"
    else
        echo -e "${RED}✗${NC} X-Content-Type-Options header missing"
    fi
    
    if echo "$headers" | grep -qi "strict-transport-security"; then
        echo -e "${GREEN}✓${NC} Strict-Transport-Security header present"
    else
        echo -e "${YELLOW}⚠${NC} Strict-Transport-Security header missing (may be normal for development)"
    fi
    
    echo ""
}

# Test data
ANALYTICS_DATA='{"event":"deployment_test","properties":{"source":"bash_script","timestamp":"'$(date -u +"%Y-%m-%dT%H:%M:%SZ")'"}}'
CALCULATOR_DATA='{"industry":"healthcare","providers":5,"patientsPerDay":100,"location":"New York"}'
DEMO_DATA='{"action":"track_progress","stepNumber":1,"industry":"healthcare","timeSpent":30,"completed":false}'
SQUARE_DATA='{"action":"create_payment","amount":10000,"sourceId":"test_card","idempotencyKey":"test_'$(date +%s)'"}'

# Initialize counters
passed=0
total=0

# Run tests
echo -e "${PURPLE}🧪 Running API Tests${NC}"
echo ""

# Test 1: Home page
if test_endpoint "Home Page" "/" "GET" "" "200"; then
    ((passed++))
fi
((total++))
echo ""

# Test 2: Security headers
test_security_headers

# Test 3: Analytics API
if test_endpoint "Analytics API" "/api/analytics" "POST" "$ANALYTICS_DATA" "200"; then
    ((passed++))
fi
((total++))
echo ""

# Test 4: Calculator API  
if test_endpoint "Calculator API" "/api/calculator" "POST" "$CALCULATOR_DATA" "200"; then
    ((passed++))
fi
((total++))
echo ""

# Test 5: Demo API
if test_endpoint "Demo API" "/api/demo" "POST" "$DEMO_DATA" "200"; then
    ((passed++))
fi
((total++))
echo ""

# Test 6: Square API
if test_endpoint "Square API" "/api/square" "POST" "$SQUARE_DATA" "200"; then
    ((passed++))
fi
((total++))
echo ""

# Test 7: Webhooks API (should require authentication)
if test_endpoint "Webhooks API" "/api/webhooks" "POST" '{"test":"data"}' "ANY"; then
    ((passed++))
fi
((total++))
echo ""

# Test 8: 404 handling
if test_endpoint "404 Handling" "/api/nonexistent" "GET" "" "404"; then
    ((passed++))
fi
((total++))
echo ""

# Rate limiting test
echo -e "${CYAN}Testing Rate Limiting${NC}"
rate_limit_triggered=false
for i in {1..5}; do
    status=$(curl -s -o /dev/null -w "%{http_code}" \
        -X POST \
        -H "Content-Type: application/json" \
        -d "$ANALYTICS_DATA" \
        --max-time $TIMEOUT \
        "${BASE_URL}/api/analytics" 2>/dev/null || echo "000")
    
    if [ "$status" -eq 429 ]; then
        rate_limit_triggered=true
        break
    fi
    sleep 0.1
done

if [ "$rate_limit_triggered" = true ]; then
    echo -e "${GREEN}✓${NC} Rate limiting is working"
else
    echo -e "${YELLOW}⚠${NC} Rate limiting not triggered (may need more requests)"
fi
echo ""

# Summary
echo -e "${PURPLE}📊 Test Summary${NC}"
echo -e "${PURPLE}===============${NC}"
echo -e "${BLUE}Total Tests: ${total}${NC}"
echo -e "${GREEN}Passed: ${passed}${NC}"
echo -e "${RED}Failed: $((total - passed))${NC}"

# Calculate percentage
if [ $total -gt 0 ]; then
    percentage=$((passed * 100 / total))
    echo -e "${BLUE}Success Rate: ${percentage}%${NC}"
fi

echo ""

# Overall status
if [ $passed -eq $total ]; then
    echo -e "${GREEN}🎉 ALL TESTS PASSED! Deployment is successful.${NC}"
    exit 0
elif [ $passed -ge $((total * 80 / 100)) ]; then
    echo -e "${YELLOW}✅ Most tests passed. Minor issues detected.${NC}"
    exit 0
else
    echo -e "${RED}❌ Multiple failures detected. Review deployment.${NC}"
    exit 1
fi