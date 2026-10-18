"""Idempotent seed: demo library items + a test admin/session for automated testing.
Run: cd /app/backend && python seed.py
"""
import asyncio
from datetime import datetime, timedelta, timezone

from lib.db import db, ensure_indexes
from models.schemas import LibraryItem

TEST_USER_ID = "user_testadmin01"
TEST_TOKEN = "test_session_maktabi_admin"

LIBRARY = [
    LibraryItem(
        title="الفصل 230 من قانون الالتزامات والعقود", section="texts", domain="civil", reference="ظهير 12 غشت 1913", date="1913-08-12",
        content="الالتزامات التعاقدية المنشأة على وجه صحيح تقوم مقام القانون بالنسبة إلى منشئيها، ولا يجوز إلغاؤها إلا برضاهما معاً أو في الحالات المنصوص عليها في القانون. (مادة تجريبية للتوضيح)",
    ),
    LibraryItem(
        title="المادة 400 من مدونة الأسرة", section="texts", domain="family", reference="القانون رقم 70.03", date="2004-02-03",
        content="كل ما لم يرد به نص في هذه المدونة، يرجع فيه إلى المذهب المالكي والاجتهاد الذي يراعى فيه تحقيق قيم الإسلام في العدل والمساواة والمعاشرة بالمعروف. (مادة تجريبية للتوضيح)",
    ),
    LibraryItem(
        title="قرار محكمة النقض — الإفراغ للاحتياج في الكراء التجاري (مثال)", section="jurisprudence", domain="commercial", reference="قرار تجريبي عدد 000/1", date="2020-01-01",
        content="مثال توضيحي لملخص اجتهاد قضائي: يتعين على المكري الذي يطالب بالإفراغ من أجل الاحتياج أن يثبت جدية هذا الاحتياج، وللمحكمة سلطة تقدير ذلك في ضوء وثائق الملف. (مادة تجريبية — يرجى استبدالها بالاجتهادات الفعلية)",
    ),
    LibraryItem(
        title="دراسة: الصلح في نزاعات الشغل الفردية", section="studies", domain="labor", reference="مقال تجريبي", date="2023-05-10",
        content="مقال توضيحي يتناول دور مسطرة الصلح التمهيدي أمام مفتش الشغل وفق مدونة الشغل، وأثر محضر الصلح على النزاع. (مادة تجريبية للتوضيح)",
    ),
]


async def main() -> None:
    await ensure_indexes()
    if await db.library.count_documents({}) == 0:
        await db.library.insert_many([i.model_dump(exclude={"attachments"}) for i in LIBRARY])
        print("library seeded")
    await db.users.update_one(
        {"user_id": TEST_USER_ID},
        {"$setOnInsert": {"user_id": TEST_USER_ID, "email": "test.admin@example.com", "name": "Test Admin", "picture": "", "role": "admin", "active": True, "is_test": True, "created_at": datetime.now(timezone.utc).isoformat()}},
        upsert=True,
    )
    await db.user_sessions.update_one(
        {"session_token": TEST_TOKEN},
        {"$set": {"user_id": TEST_USER_ID, "expires_at": datetime.now(timezone.utc) + timedelta(days=365), "created_at": datetime.now(timezone.utc)}},
        upsert=True,
    )
    print("test admin ready")


if __name__ == "__main__":
    asyncio.run(main())
