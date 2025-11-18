from sqlalchemy.ext.asyncio import create_async_engine, async_sessionmaker, AsyncSession

DATABASE_URL = "postgresql+asyncpg://user:password@localhost:5432/universities.db"
#потом видимо вместо юзера и пасворда что-то подставим

engine = create_async_engine(
    DATABASE_URL,
    echo=True,   # вывод SQL в консоль (по желанию)
)

async_session = async_sessionmaker(
    engine,
    expire_on_commit=False,
)

# Депенденси для FastAPI
async def get_session() -> AsyncSession:
    async with async_session() as session:
        yield session
