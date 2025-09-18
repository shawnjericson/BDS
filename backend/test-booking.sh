#!/bin/bash

API_BASE_URL="http://172.16.0.39:3000"

echo "🔐 Logging in..."
LOGIN_RESPONSE=$(curl -s -X POST "$API_BASE_URL/auth/login" \
  -H "Content-Type: application/json" \
  -d '{"email": "seller@example.com", "password": "password123"}')

echo "Login response: $LOGIN_RESPONSE"

TOKEN=$(echo $LOGIN_RESPONSE | grep -o '"access_token":"[^"]*"' | cut -d'"' -f4)
echo "Token: $TOKEN"

if [ -z "$TOKEN" ]; then
  echo "❌ Failed to get token"
  exit 1
fi

echo "📦 Getting approved products..."
PRODUCTS_RESPONSE=$(curl -s -X GET "$API_BASE_URL/products/approved" \
  -H "Authorization: Bearer $TOKEN")

echo "Products response: $PRODUCTS_RESPONSE"

echo "📝 Creating booking..."
BOOKING_RESPONSE=$(curl -s -X POST "$API_BASE_URL/bookings" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "productId": 1,
    "price": 1000000,
    "customerName": "Test Customer",
    "customerPhone": "0123456789",
    "customerEmail": "test@example.com"
  }')

echo "Booking response: $BOOKING_RESPONSE"
