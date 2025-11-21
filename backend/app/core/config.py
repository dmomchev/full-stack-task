from pydantic import  PostgresDsn, computed_field
from pydantic_settings import BaseSettings

class Settings(BaseSettings):

    # Postgres
    # DATABASE_URL: str = "postgresql+asyncpg://user:password@localhost:5432/mydb"
    POSTGRES_USER: str = "postgres"
    POSTGRES_PASSWORD: str = "postgres"
    POSTGRES_SERVER: str = "localhost"
    POSTGRES_PORT: int = 5432
    POSTGRES_DB: str = "cardb"

    @computed_field  # type: ignore[prop-decorator]
    @property
    def SQLALCHEMY_DATABASE_URI(self) -> PostgresDsn:
        return PostgresDsn.build(
            scheme="postgresql+asyncpg", # "postgresql+psycopg"
            username=self.POSTGRES_USER,
            password=self.POSTGRES_PASSWORD,
            host=self.POSTGRES_SERVER,
            port=self.POSTGRES_PORT,
            path=self.POSTGRES_DB,
        )

    class Config:
        env_file = ".env"

settings = Settings()
