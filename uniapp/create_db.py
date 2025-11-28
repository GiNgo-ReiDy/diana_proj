import asyncio
from uniapp.database import engine
from uniapp.models import Base


async def recreate_all_tables():
    async with engine.begin() as conn:
        # Удалить все таблицы (SQLAlchemy сам учтёт зависимости)
        await conn.run_sync(Base.metadata.drop_all)
        
        # Создать все таблицы заново
        await conn.run_sync(Base.metadata.create_all)

    print("✔ All tables recreated successfully!")


if __name__ == "__main__":
    asyncio.run(recreate_all_tables())
