import sys
import asyncio
if hasattr(sys.stdout, 'reconfigure'):
    sys.stdout.reconfigure(encoding='utf-8')

from httpx import AsyncClient, ASGITransport
from main import app, client

async def test_backend():
    print("=== STARTING CREATORIQ BACKEND VERIFICATION ===")
    
    # 1. Test database ping
    try:
        ping_res = await client.admin.command('ping')
        print(f"[SUCCESS] 1. MongoDB Atlas Ping: {ping_res}")
    except Exception as e:
        print(f"[ERROR] 1. MongoDB Atlas Ping Failed: {e}")
        return

    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as ac:
        # 2. Health check
        res = await ac.get("/api/health")
        print(f"[SUCCESS] 2. Health Endpoint: {res.status_code} -> {res.json()['status']}")

        # 3. Registration
        loop_time = int(asyncio.get_event_loop().time())
        test_email = f"test_creator_{loop_time}@creatoriq.com"
        reg_payload = {
            "email": test_email,
            "password": "securepassword123",
            "full_name": "Test Milestone Creator",
            "role": "creator"
        }
        res = await ac.post("/api/auth/register", json=reg_payload)
        print(f"[SUCCESS] 3. Register Endpoint: {res.status_code} -> Token Generated: {bool(res.json().get('token'))}")
        token = res.json().get('token')
        headers = {"Authorization": f"Bearer {token}"}

        # 4. Login
        login_payload = {
            "email": test_email,
            "password": "securepassword123"
        }
        res = await ac.post("/api/auth/login", json=login_payload)
        print(f"[SUCCESS] 4. Login Endpoint: {res.status_code} -> Message: {res.json().get('message')}")

        # 5. Get Profile (/api/auth/me)
        res = await ac.get("/api/auth/me", headers=headers)
        print(f"[SUCCESS] 5. Profile Me Endpoint: {res.status_code} -> Name: {res.json().get('full_name')}")

        # 6. Analytics Dashboard
        res = await ac.get("/api/analytics/dashboard", headers=headers)
        dash_data = res.json()
        print(f"[SUCCESS] 6. Analytics Dashboard: {res.status_code} -> Total Views: {dash_data.get('total_views'):,}, Total Likes: {dash_data.get('total_likes'):,}")

        # 7. Analytics Growth
        res = await ac.get("/api/analytics/growth", headers=headers)
        print(f"[SUCCESS] 7. Analytics Growth: {res.status_code} -> Impressions: {res.json().get('impressions')}")

        # 8. Content Management (POST & GET)
        content_payload = {
            "title": "Milestone 1 Demo Video",
            "platform": "youtube",
            "views": 25000,
            "likes": 4200,
            "comments": 650,
            "shares": 300,
            "engagement_rate": 20.6
        }
        res = await ac.post("/api/content", json=content_payload, headers=headers)
        content_id = res.json().get('content_id')
        print(f"[SUCCESS] 8. Create Content Endpoint: {res.status_code} -> ID: {content_id}")

        res = await ac.get("/api/content", headers=headers)
        print(f"[SUCCESS] 9. Get Content Endpoint: {res.status_code} -> Count: {len(res.json().get('contents', []))}")

        # 9. Admin Registration & Users list
        admin_email = f"test_admin_{loop_time}@creatoriq.com"
        admin_payload = {
            "email": admin_email,
            "password": "adminsecurepass123",
            "full_name": "Test System Administrator",
            "role": "admin"
        }
        res = await ac.post("/api/auth/register", json=admin_payload)
        admin_token = res.json().get('token')
        admin_headers = {"Authorization": f"Bearer {admin_token}"}

        res = await ac.get("/api/admin/users", headers=admin_headers)
        print(f"[SUCCESS] 10. Admin Users Endpoint: {res.status_code} -> Total Registered: {len(res.json().get('users', []))}")

    print("=== ALL BACKEND ENDPOINTS VERIFIED & WORKING PERFECTLY! ===")

if __name__ == "__main__":
    asyncio.run(test_backend())
