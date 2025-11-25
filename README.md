# Car Specification Management

A comprehensive FastAPI backend with PostgreSQL and React-Vite frontend, implementing a robust User-Roles-Permissions system for car specification management.

## Prerequisites

- Docker & Docker Compose
- Python 3.10+ (for local development)
- Node 20+ (for local development)

## Setup & Installation

### 1. Clone the repository
```bash
git clone https://github.com/dmomchev/full-stack-task.git
cd full-stack-task
```
### 2. Create environment file
```bash
cp .env.example .env
```

Edit `.env` with your settings:
```env
POSTGRES_SERVER=localhost
POSTGRES_USER=postgres
POSTGRES_PASSWORD=postgres
POSTGRES_DB=cardb
SECRET_KEY=secret-key
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30
ADMIN_PASSWORD=admin123
```

### 3. Start services with Docker Compose
```bash
# From project root
docker-compose up --build
```

Access the frontend at http://localhost:3000
Backend API at http://localhost:8000

```
Default user: admin 
With password provided in the env settings above
```
### 4. Local Development (Optional)

```bash
cd backend

# create and activate virtual environment
python -m venv venv
source venv/bin/activate

# install Install dependencies
pip install -r requirements.txt

# run db migrations (after connecting to db)
alembic upgrade head

# run FastAPI server
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

If you want to run the frontend separately for development:
```bash
cd frontend
npm install
npm run dev
```

The frontend dev server runs on http://localhost:3000 and proxies API requests to http://localhost:8000.

## Architecture

The backend follows a **clean architecture pattern** with clear separation of concerns:

```
Entity (Models) → Repository → Service → Controller (API Routes)
```

- **Models/Entities**: SQLAlchemy ORM models defining database structure
- **Repositories**: Data access layer with CRUD operations
- **Services**: Business logic layer
- **Controllers**: API endpoints and request/response handling

## Features

### Authentication & Authorization
- JWT-based authentication
- Role-based access control (RBAC)
- Permission-based authorization
- Three user roles: Admin, CarSpec, User

### Car Management
- Full CRUD for Brands, Models, Submodels, Generations
- Car specifications with detailed attributes
- Filtering, sorting, and pagination
- User-specific "My Cars" feature

### User Management
- User CRUD operations (Admin only)
- Role assignment
- Password hashing with bcrypt

## User Roles & Permissions

### Admin
Full system access:
- All CRUD operations on users
- All CRUD operations on car data
- Assign roles and permissions
- Manage "My Cars" list
- Permissions: `"users:crud", "cars:write", "cars:delete", "cars:read", "my_cars"`

### CarSpec
Car specification manager:
- Create and update car information
- Delete only items they created
- Read all car information
- Manage "My Cars" list
- Permissions: `"cars:write", "cars:update_own", "cars:delete_own", "cars:read"`

### User
Read-only access:
- Read all car information
- Add/remove cars to "My Cars" list
- Permissions: `"cars:read", "my_cars"`

## API Endpoints
Swagger documentation: http://127.0.0.1:8000/docs

- Authentication
  - `POST /login/access-token`

- Users
  - `POST /users`
  - `GET /users`
  - `GET /users/{user_id}`
  - `PUT /users/{user_id}`
  - `DELETE /users/{user_id}`
  - `POST /users/{user_id}/role`
  - `GET /users/{user_id}/roles`
  - `DELETE /users/{user_id}/roles/{role_name}`

- Roles & Permissions
  - `GET /roles`
  - `GET /roles/{role_id}/permissions`

- Brands
  - `POST /brands`
  - `GET /brands`
  - `GET /brands/{brand_id}`
  - `PUT /brands/{brand_id}`
  - `DELETE /brands/{brand_id}`

- Models
  - `POST /brands/{brand_id}/models`
  - `GET /brands/{brand_id}/models`
  - `GET /brands/{brand_id}/models/{model_id}`
  - `PUT /brands/{brand_id}/models/{model_id}`
  - `DELETE /brands/{brand_id}/models/{model_id}`

- Submodels
  - `POST /models/{model_id}/submodels`
  - `GET /models/{model_id}/submodels`
  - `GET /models/{model_id}/submodels/{submodel_id}`
  - `PUT /models/{model_id}/submodels/{submodel_id}`
  - `DELETE /models/{model_id}/submodels/{submodel_id}`

- Generations
  - `POST /submodels/{submodel_id}/generations`
  - `GET /submodels/{submodel_id}/generations`
  - `GET /submodels/{submodel_id}/generations/{generation_id}`
  - `PUT /submodels/{submodel_id}/generations/{generation_id}`
  - `DELETE /submodels/{submodel_id}/generations/{generation_id}`

- Car Specifications
  - `POST /generations/{generation_id}/specs`
  - `GET /generations/{generation_id}/specs`
  - `GET /specs/{spec_id}`
  - `PUT /generations/{generation_id}/specs/{spec_id}`
  - `DELETE /generations/{generation_id}/specs/{spec_id}`

- My Cars
  - `POST /my-cars/{car_spec_id}`
  - `DELETE /my-cars/{car_spec_id}`
  - `GET /my-cars`

## Frontend Routes

- `/login` - Authentication page
- `/` (authenticated) - Catalog page (default landing)
- `/catalog` - Browse car catalog with tree view and filters
- `/my-cars` - User's saved cars collection (Admin, User roles)
- `/admin` - User management panel (Admin only)
- `/car-spec` - Car specification management (Admin, CarSpec roles)

## Tech Stack
### Backend
- FastAPI
- uvicorn
- SQLAlchemy (ORM)
- Alembic (migrations)
- PostgreSQL
- JWT authentication
- bcrypt (password hashing)

### Frontend
- React + Vite + TypeScript
- @tanstack/react-router (file-based routing)
- @tanstack/react-query (server state)
- @tanstack/react-form (forms)
- Zod (validation)
- axios (HTTP client)
- Tailwind CSS (styling)