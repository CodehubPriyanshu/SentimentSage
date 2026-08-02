#!/usr/bin/env python3
"""
Simple test script to verify backend connectivity
"""

import requests
import json

def test_backend():
    """Test backend endpoints"""
    base_url = "http://localhost:8080"
    
    print("Testing backend connectivity...")
    print(f"Base URL: {base_url}")
    print("=" * 50)
    
    # Test ping endpoint
    print("1. Testing /api/ping endpoint:")
    try:
        response = requests.get(f"{base_url}/api/ping")
        print(f"   Status Code: {response.status_code}")
        print(f"   Response: {response.json()}")
    except requests.exceptions.ConnectionError:
        print("   ERROR: Could not connect to backend. Is it running?")
        return False
    except Exception as e:
        print(f"   ERROR: {str(e)}")
        return False
    
    # Test signup endpoint (without actually signing up)
    print("\n2. Testing /api/auth/signup endpoint:")
    try:
        response = requests.post(
            f"{base_url}/api/auth/signup",
            headers={"Content-Type": "application/json"},
            json={}
        )
        print(f"   Status Code: {response.status_code}")
        print(f"   Response: {response.json()}")
    except requests.exceptions.ConnectionError:
        print("   ERROR: Could not connect to backend. Is it running?")
        return False
    except Exception as e:
        print(f"   ERROR: {str(e)}")
        return False
    
    # Test login endpoint (without actually logging in)
    print("\n3. Testing /api/auth/login endpoint:")
    try:
        response = requests.post(
            f"{base_url}/api/auth/login",
            headers={"Content-Type": "application/json"},
            json={}
        )
        print(f"   Status Code: {response.status_code}")
        print(f"   Response: {response.json()}")
    except requests.exceptions.ConnectionError:
        print("   ERROR: Could not connect to backend. Is it running?")
        return False
    except Exception as e:
        print(f"   ERROR: {str(e)}")
        return False
    
    print("\n" + "=" * 50)
    print("Backend test completed!")
    return True

if __name__ == "__main__":
    test_backend()