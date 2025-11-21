# Car Specification Management

A comprehensive FastAPI backend with PostgreSQL, implementing a robust User-Roles-Permissions system for car specification management.


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

## Prerequisites

- Docker & Docker Compose
- Python 3.11+ (for local development)

## Setup & Installation

### 1. Clone the repository
```bash
git clone https://github.com/dmomchev/full-stack-task.git

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
```

### 3. Start services with Docker Compose
```bash
# From project root
docker-compose up --build
```
## User Roles & Permissions

### Admin
Full system access:
- All CRUD operations on users
- All CRUD operations on car data
- Assign roles and permissions
- Manage "My Cars" list

### CarSpec
Car specification manager:
- Create and update car information
- Delete only items they created
- Read all car information
- Manage "My Cars" list

### User
Read-only access:
- Read all car information
- Add/remove cars to "My Cars" list

## API Endpoints
---
<!-- TODO -->