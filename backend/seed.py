"""Idempotent seed: two independent test offices (admin + session each) for automated testing.
Run: cd /app/backend && python seed.py
"""
import asyncio
from datetime import datetime, timedelta, timezone

from lib.db import ensure_indexes, raw
from models.schemas import LibraryItem  # noqa: F401  (demo LIBRARY kept for reference, not seeded)

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


TEST_ACCOUNTS = [  # (user_id, email, name, office_id, office_name, session token)
    (TEST_USER_ID, "test.admin@example.com", "Test Admin", "office_test_a", "مكتب الاختبار أ", TEST_TOKEN),
    ("user_testadmin02", "test.office.b@example.com", "Test Office B", "office_test_b", "مكتب الاختبار ب", "test_session_office_b"),
]


async def main() -> None:
    await ensure_indexes()
    now = datetime.now(timezone.utc)
    for uid, email, name, oid, oname, token in TEST_ACCOUNTS:
        await raw.offices.update_one({"id": oid}, {"$setOnInsert": {"id": oid, "name": oname, "owner_email": email, "active": True,
                                                                     "invite_code": f"TEST{oid[-1].upper()}0001", "created_at": now.isoformat()}}, upsert=True)
        await raw.office.update_one({"_id": f"{oid}:office"}, {"$setOnInsert": {"name": oname, "office_id": oid}}, upsert=True)
        await raw.users.update_one(
            {"user_id": uid},
            {"$setOnInsert": {"user_id": uid, "email": email, "name": name, "picture": "", "role": "admin", "active": True, "is_test": True,
                              "office_id": oid, "created_at": now.isoformat()}},
            upsert=True,
        )
        await raw.user_sessions.update_one(
            {"session_token": token},
            {"$set": {"user_id": uid, "expires_at": now + timedelta(days=365), "created_at": now}},
            upsert=True,
        )
    print("test offices ready")


if __name__ == "__main__":
    asyncio.run(main())
