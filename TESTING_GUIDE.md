# 🧪 Production Deployment Testing Guide

## Overview
This guide provides comprehensive testing tools to verify your AI Chatbot Solutions deployment is working correctly.

## 📁 Test Files Created

### 1. `test-deployment.js` - Comprehensive Node.js Test Suite
- **Features**: Detailed API testing, performance analysis, security header verification
- **Usage**: `node test-deployment.js [URL]`
- **Best for**: Detailed debugging and comprehensive validation

### 2. `test-deployment.sh` - Quick Bash Test Script  
- **Features**: Fast endpoint testing, rate limiting checks, colored output
- **Usage**: `./test-deployment.sh [URL]`
- **Best for**: Quick verification and CI/CD pipelines

## 🚀 How to Run Tests

### After Local Development
```bash
# Test local development server
npm run dev &
node test-deployment.js http://localhost:3000
```

### After Vercel Deployment
```bash
# Test production deployment
node test-deployment.js https://aichatbotsolutions.io

# Or use the quick bash script
./test-deployment.sh https://aichatbotsolutions.io
```

### Test Specific Vercel Preview
```bash
# Test specific Vercel preview URL
node test-deployment.js https://aichatbotsolutions-abc123.vercel.app
```

## 🔍 What Gets Tested

### ✅ Core Functionality
- **Home Page**: Loads correctly with proper response
- **Analytics API**: Event tracking endpoint functionality
- **Calculator API**: ROI calculation with industry-specific logic
- **Demo API**: Demo progress tracking and feedback
- **Square API**: Payment processing endpoints (mock responses)
- **Webhooks API**: Webhook handling and security

### 🛡️ Security Features
- **Security Headers**: X-Frame-Options, X-Content-Type-Options, CSP
- **Rate Limiting**: API protection against abuse
- **HTTPS**: SSL certificate validation
- **Error Handling**: Proper 404 and error responses

### ⚡ Performance Metrics
- **Response Times**: API endpoint performance
- **Loading Speed**: Page load optimization
- **CDN Distribution**: Global content delivery
- **Caching**: Static asset optimization

## 📊 Test Output Examples

### Successful Test Output
```
🚀 AI Chatbot Solutions - Production Deployment Test Suite
============================================================
Base URL: https://aichatbotsolutions.io

Testing: Analytics API
URL: https://aichatbotsolutions.io/api/analytics
Status: 200
Response Time: 234ms
Security Headers:
  ✓ x-frame-options: DENY
  ✓ x-content-type-options: nosniff
  ✓ referrer-policy: strict-origin-when-cross-origin
Rate Limiting: Active
✓ PASS - Analytics API

📊 Test Summary
===============
Total Tests: 8
Passed: 8
Failed: 0
Success Rate: 100%
🎉 ALL TESTS PASSED! Deployment is successful.
```

### Failed Test Output
```
Testing: Calculator API
URL: https://aichatbotsolutions.io/api/calculator
Status: 500
Response Time: 1203ms
✗ FAIL - Calculator API (Status: 500)
Error: {"error": "Database connection failed"}
```

## 🔧 Troubleshooting Common Issues

### Environment Variables Not Set
**Symptom**: 500 errors on API endpoints
**Solution**: 
```bash
# Check Vercel environment variables
npx vercel env ls

# Add missing variables
npx vercel env add VARIABLE_NAME
```

### Rate Limiting Too Strict
**Symptom**: 429 errors during testing
**Solution**: Wait 60 seconds between test runs or adjust rate limits in `lib/rate-limit.ts`

### Database Connection Issues
**Symptom**: Database-related 500 errors
**Solution**: Verify `DATABASE_URL` in Vercel dashboard matches your Supabase connection string

### Redis Connection Issues  
**Symptom**: Rate limiting not working
**Solution**: Verify `REDIS_URL` and `UPSTASH_REDIS_REST_*` variables are correctly set

## 🎯 Advanced Testing

### Load Testing
```bash
# Test with multiple concurrent requests
for i in {1..10}; do
  curl -X POST https://aichatbotsolutions.io/api/analytics \
    -H "Content-Type: application/json" \
    -d '{"event":"load_test","properties":{"batch":'$i'}}' &
done
wait
```

### Security Testing
```bash
# Test security headers
curl -I https://aichatbotsolutions.io | grep -i security

# Test CORS protection
curl -H "Origin: https://malicious-site.com" \
  https://aichatbotsolutions.io/api/analytics
```

### Performance Testing
```bash
# Test response times with curl
curl -w "@curl-format.txt" -o /dev/null -s https://aichatbotsolutions.io

# Where curl-format.txt contains:
#     time_namelookup:  %{time_namelookup}\n
#        time_connect:  %{time_connect}\n
#     time_appconnect:  %{time_appconnect}\n
#    time_pretransfer:  %{time_pretransfer}\n
#       time_redirect:  %{time_redirect}\n
#  time_starttransfer:  %{time_starttransfer}\n
#                     ----------\n
#          time_total:  %{time_total}\n
```

## 📈 Monitoring Setup

### Vercel Analytics
- Automatically enabled for performance monitoring
- View metrics at: https://vercel.com/dashboard/analytics

### Custom Monitoring
```bash
# Set up continuous monitoring (run every 5 minutes)
echo "*/5 * * * * /path/to/test-deployment.sh https://aichatbotsolutions.io" | crontab -
```

## 🔄 CI/CD Integration

### GitHub Actions Example
```yaml
name: Test Deployment
on:
  deployment_status:
jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - name: Test Deployment
        run: ./test-deployment.sh ${{ github.event.deployment_status.target_url }}
```

## ✅ Success Criteria

Your deployment is successful when:
- ✅ All API endpoints return 2xx status codes
- ✅ Security headers are present
- ✅ Rate limiting is functional
- ✅ Average response time < 1000ms
- ✅ No JavaScript errors in browser console
- ✅ Database and Redis connections work
- ✅ Payment processing endpoints respond correctly

## 🆘 Support

If tests fail consistently:
1. Check Vercel deployment logs
2. Verify all environment variables are set
3. Test individual API endpoints manually
4. Review Next.js build output for errors
5. Check database and Redis connectivity

---

**Your AI Chatbot Solutions deployment testing is now automated and comprehensive! 🚀**
