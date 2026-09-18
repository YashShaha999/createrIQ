import sys
import asyncio
import random
import string
import httpx
from app.main import app

# Ensure UTF-8 output on Windows terminal
if hasattr(sys.stdout, 'reconfigure'):
    sys.stdout.reconfigure(encoding='utf-8')

BASE = "http://127.0.0.1:8000"

def rand_email():
    return "".join(random.choices(string.ascii_lowercase, k=8)) + "@creatoriq-test.com"

async def run_verification():
    print("=== CreatorIQ Backend Verification ===")

    # Check if live server is running on localhost:8000
    is_live = False
    try:
        async with httpx.AsyncClient(base_url=BASE, timeout=1.0) as check_client:
            r = await check_client.get("/health/db")
            if r.status_code == 200:
                is_live = True
    except Exception:
        is_live = False

    if is_live:
        print("Connected to live server at http://localhost:8000\n")
        client = httpx.AsyncClient(base_url=BASE, timeout=15.0)
    else:
        print("Testing via in-process ASGI Transport (no live server needed)\n")
        transport = httpx.ASGITransport(app=app)
        client = httpx.AsyncClient(transport=transport, base_url="http://test", timeout=15.0)

    async with client:
        # 1. DB ping
        r = await client.get("/health/db")
        print(f"[1] MongoDB Atlas Health Check: {r.status_code} -> {r.json()}")
        assert r.status_code == 200, "Health check failed"

        # 2. Register new creator
        email = rand_email()
        reg_payload = {
            "name": "Alex Creator",
            "email": email,
            "password": "secretpassword123",
            "role": "creator"
        }
        reg = await client.post("/auth/register", json=reg_payload)
        print(f"[2] Register Endpoint: {reg.status_code} -> Token: {bool(reg.json().get('access_token'))}")
        assert reg.status_code == 200, f"Register failed: {reg.text}"
        token = reg.json()["access_token"]
        headers = {"Authorization": f"Bearer {token}"}

        # 3. Login
        log_payload = {"email": email, "password": "secretpassword123"}
        log = await client.post("/auth/login", json=log_payload)
        print(f"[3] Login Endpoint: {log.status_code} -> User: {log.json().get('user', {}).get('name')}")
        assert log.status_code == 200, f"Login failed: {log.text}"

        # 4. /auth/me profile
        me = await client.get("/auth/me", headers=headers)
        print(f"[4] Profile /auth/me: {me.status_code} -> Role: {me.json().get('role')}")
        assert me.status_code == 200, "Get me failed"

        # 5. Dashboard summary
        summ = await client.get("/dashboard/summary", headers=headers)
        kpi_keys = list(summ.json()['kpis'].keys())
        print(f"[5] Dashboard Summary: {summ.status_code} -> KPIs: {kpi_keys}")
        assert summ.status_code == 200, "Dashboard summary failed"

        # 6. Content create + list
        content_payload = {
            "title": "My First YouTube Video",
            "platform": "youtube",
            "url": "https://youtube.com/watch?v=demo123"
        }
        c_res = await client.post("/api/content/", headers=headers, json=content_payload)
        print(f"[6a] Create Content: {c_res.status_code} -> ID: {c_res.json().get('id')}")
        assert c_res.status_code == 201, "Create content failed"

        lst = await client.get("/api/content/", headers=headers)
        print(f"[6b] List Content: {lst.status_code} -> Total: {lst.json().get('count')} item(s)")
        assert lst.status_code == 200, "List content failed"

        # 7. Admin guard (should be 403 Forbidden for creator)
        adm = await client.get("/api/admin/users", headers=headers)
        print(f"[7] Admin Guard (Creator access): {adm.status_code} (Expected 403 Forbidden)")
        assert adm.status_code == 403, f"Expected 403, got {adm.status_code}"

        # 8. Register Admin & verify admin access
        admin_email = rand_email()
        admin_reg = await client.post("/auth/register", json={
            "name": "Lead Admin",
            "email": admin_email,
            "password": "adminsecret123",
            "role": "admin"
        })
        admin_token = admin_reg.json()["access_token"]
        admin_headers = {"Authorization": f"Bearer {admin_token}"}

        adm_success = await client.get("/api/admin/users", headers=admin_headers)
        adm_data = adm_success.json()
        users_count = len(adm_data) if isinstance(adm_data, list) else adm_data.get('total', 0)
        print(f"[8] Admin Access (Admin role): {adm_success.status_code} -> Registered users: {users_count}")
        assert adm_success.status_code == 200, "Admin access failed"

        # 9. Profile Update (PUT /auth/me)
        update_payload = {
            "name": "Alex Updated Creator",
            "bio": "Building student projects with React & FastAPI.",
            "social_links": {
                "youtube": "@AlexCreator",
                "instagram": "@alex_creates",
                "twitter": "@alexcreates",
                "linkedin": "@alex_tok"
            }
        }
        upd = await client.put("/auth/me", headers=headers, json=update_payload)
        print(f"[9] Profile Update (PUT /auth/me): {upd.status_code} -> Bio: {upd.json().get('bio')}")
        assert upd.status_code == 200, f"Profile update failed: {upd.text}"
        assert upd.json().get("bio") == update_payload["bio"], "Bio mismatch"
        assert upd.json().get("name") == update_payload["name"], "Name mismatch"

        # 10. Admin Create User (POST /api/admin/users)
        new_test_email = rand_email()
        create_user_payload = {
            "name": "New Student Creator",
            "email": new_test_email,
            "password": "testpassword123",
            "role": "creator"
        }
        create_res = await client.post("/api/admin/users", headers=admin_headers, json=create_user_payload)
        print(f"[10] Admin Create User: {create_res.status_code} -> Created ID: {create_res.json().get('id')}")
        assert create_res.status_code == 201, f"Admin create user failed: {create_res.text}"
        created_user_id = create_res.json().get("id")

        # 11. Admin Update Role (PATCH /api/admin/users/{id}/role)
        role_res = await client.patch(
            f"/api/admin/users/{created_user_id}/role",
            headers=admin_headers,
            json={"role": "admin"}
        )
        print(f"[11] Admin Role Change: {role_res.status_code} -> New Role: {role_res.json().get('role')}")
        assert role_res.status_code == 200, f"Role change failed: {role_res.text}"
        assert role_res.json().get("role") == "admin", "Role was not updated to admin"

        # 12. Admin Delete User (DELETE /api/admin/users/{id}) & Self-deletion guard
        self_del = await client.delete(
            f"/api/admin/users/{admin_reg.json()['user']['id']}",
            headers=admin_headers
        )
        print(f"[12a] Self-Deletion Guard: {self_del.status_code} (Expected 400 Bad Request)")
        assert self_del.status_code == 400, f"Expected 400 for self-deletion, got {self_del.status_code}"

        del_res = await client.delete(f"/api/admin/users/{created_user_id}", headers=admin_headers)
        print(f"[12b] Admin Delete User: {del_res.status_code} -> Success: {del_res.json().get('message')}")
        assert del_res.status_code == 200, f"Delete user failed: {del_res.text}"

        print("\n=== ALL 12 VERIFICATION CHECKS PASSED PERFECTLY! ===")

if __name__ == "__main__":
    asyncio.run(run_verification())
