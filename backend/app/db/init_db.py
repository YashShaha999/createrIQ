from datetime import datetime, timedelta
from app.core.security import hash_password
from app.db.session import users_collection, content_collection

async def ensure_demo_users():
    """
    Auto-seeds default demo users (Admin & Creator) and initial sample content
    if they do not exist in the database. Ensures demo logins always work even
    if the database is deleted/cleared.
    """
    try:
        now = datetime.utcnow()
        
        # 1. Ensure Demo Admin exists
        admin_email = "admin@creatoriq.com"
        admin_user = await users_collection.find_one({"email": admin_email})
        if not admin_user:
            await users_collection.insert_one({
                "email": admin_email,
                "password": hash_password("adminpass123"),
                "full_name": "Sarah Admin",
                "role": "admin",
                "bio": "System Administrator & Platform Manager.",
                "profile_picture": "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80",
                "social_links": {
                    "youtube": "@creatoriq_admin",
                    "instagram": "@creatoriq",
                    "tiktok": "@creatoriq",
                    "twitter": "@creatoriq_hq"
                },
                "created_at": now,
                "updated_at": now,
                "is_active": True
            })
            print("✅ Demo Admin auto-created: admin@creatoriq.com")

        # 2. Ensure Demo Creator exists
        creator_email = "alex.creator@creatoriq.com"
        creator_user = await users_collection.find_one({"email": creator_email})
        if not creator_user:
            await users_collection.insert_one({
                "email": creator_email,
                "password": hash_password("password123"),
                "full_name": "Alex Morgan",
                "role": "creator",
                "bio": "Tech & Lifestyle Creator sharing weekly web development and programming tutorials.",
                "profile_picture": "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80",
                "social_links": {
                    "youtube": "@alexcreates",
                    "instagram": "@alex_morgan",
                    "tiktok": "@alex.tech",
                    "twitter": "@alexmorgan"
                },
                "created_at": now,
                "updated_at": now,
                "is_active": True
            })
            print("✅ Demo Creator auto-created: alex.creator@creatoriq.com")

        # 3. Ensure sample content exists for Creator
        content_count = await content_collection.count_documents({"user_id": creator_email})
        if content_count == 0:
            sample_posts = [
                {
                    "user_id": creator_email,
                    "title": "How to Build Fullstack Apps in 2026",
                    "platform": "youtube",
                    "views": 15400,
                    "likes": 3200,
                    "comments": 410,
                    "shares": 180,
                    "engagement_rate": 8.44,
                    "created_at": now - timedelta(days=2)
                },
                {
                    "user_id": creator_email,
                    "title": "Top 5 CSS Tricks for Clean UI",
                    "platform": "instagram",
                    "views": 12100,
                    "likes": 2800,
                    "comments": 310,
                    "shares": 240,
                    "engagement_rate": 8.51,
                    "created_at": now - timedelta(days=4)
                },
                {
                    "user_id": creator_email,
                    "title": "A Day in the Life of a Software Engineer",
                    "platform": "tiktok",
                    "views": 9800,
                    "likes": 2100,
                    "comments": 190,
                    "shares": 120,
                    "engagement_rate": 6.94,
                    "created_at": now - timedelta(days=6)
                },
                {
                    "user_id": creator_email,
                    "title": "Why MongoDB + FastAPI is the Best Stack",
                    "platform": "youtube",
                    "views": 8500,
                    "likes": 1900,
                    "comments": 140,
                    "shares": 95,
                    "engagement_rate": 6.65,
                    "created_at": now - timedelta(days=8)
                }
            ]
            await content_collection.insert_many(sample_posts)
            print("✅ Sample Creator content posts auto-seeded")

    except Exception as e:
        print(f"Warning: Auto-seeding demo users encountered: {e}")
