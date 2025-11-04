# BlockShare Backend

Django REST API backend for BlockShare decentralized file storage application.

## Features

- User Registration with validation
- User Login with JWT authentication
- MySQL database integration
- CORS support for React frontend
- Password strength validation
- Email validation
- Token-based authentication

## Requirements

- Python 3.8+
- MySQL 5.7+ or MySQL 8.0+
- pip (Python package manager)

## Setup Instructions

### 1. Create MySQL Database

First, create a MySQL database for the application:

```sql
CREATE DATABASE blockshare_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

### 2. Create Virtual Environment

```bash
cd backend
python -m venv venv
```

### 3. Activate Virtual Environment

**Windows:**
```bash
venv\Scripts\activate
```

**Linux/Mac:**
```bash
source venv/bin/activate
```

### 4. Install Dependencies

```bash
pip install -r requirements.txt
```

### 5. Configure Environment Variables

Create a `.env` file in the backend directory with your MySQL credentials:

```env
# Django Settings
SECRET_KEY=your-secret-key-here
DEBUG=True

# Database Configuration
DB_NAME=blockshare_db
DB_USER=root
DB_PASSWORD=your_mysql_password
DB_HOST=localhost
DB_PORT=3306

# JWT Configuration
JWT_SECRET_KEY=your-jwt-secret-key-here
```

**Important:** Replace the following values:
- `DB_PASSWORD`: Your MySQL root password or database user password
- `DB_USER`: Your MySQL username (default is `root`)
- `SECRET_KEY`: Generate a secure random string
- `JWT_SECRET_KEY`: Generate another secure random string

### 6. Run Database Migrations

```bash
python manage.py makemigrations
python manage.py migrate
```

### 7. Create Admin User (Optional)

```bash
python manage.py createsuperuser
```

### 8. Start Development Server

```bash
python manage.py runserver 8000
```

The API will be available at `http://localhost:8000/`

## API Endpoints

### Authentication

#### Register User
- **URL:** `POST /api/register/`
- **Body:**
```json
{
  "username": "johndoe",
  "email": "john@example.com",
  "password": "SecurePass123"
}
```
- **Response:**
```json
{
  "success": true,
  "message": "Registration successful",
  "token": "jwt_token_here",
  "userId": 1,
  "email": "john@example.com",
  "username": "johndoe"
}
```

#### Login
- **URL:** `POST /api/login/`
- **Body:**
```json
{
  "email": "john@example.com",
  "password": "SecurePass123"
}
```
- **Response:**
```json
{
  "success": true,
  "message": "Login successful",
  "token": "jwt_token_here",
  "userId": 1,
  "email": "john@example.com",
  "username": "johndoe"
}
```

#### Verify Token
- **URL:** `GET /api/verify-token/`
- **Headers:** `Authorization: Bearer <token>`
- **Response:**
```json
{
  "success": true,
  "user_id": 1,
  "email": "john@example.com"
}
```

## Password Requirements

- Minimum 6 characters
- At least one uppercase letter
- At least one lowercase letter
- At least one number

## Database Schema

### Users Table

| Column | Type | Description |
|--------|------|-------------|
| id | BigInt | Primary key |
| username | Varchar(150) | Unique username |
| email | Varchar(255) | Unique email address |
| password | Varchar(255) | Hashed password |
| is_active | Boolean | Account status |
| created_at | DateTime | Account creation timestamp |
| updated_at | DateTime | Last update timestamp |
| last_login | DateTime | Last login timestamp |

## Troubleshooting

### MySQL Connection Issues

If you encounter MySQL connection errors:

1. **Check MySQL is running:**
   ```bash
   # Windows
   net start MySQL80
   
   # Linux
   sudo systemctl start mysql
   ```

2. **Verify credentials in .env file**

3. **Test MySQL connection:**
   ```bash
   mysql -u root -p
   ```

### Import Error: mysqlclient

If you get an error installing mysqlclient on Windows:

1. Download and install Microsoft C++ Build Tools
2. Or use PyMySQL as an alternative:
   ```bash
   pip install pymysql
   ```
   
   Add to `__init__.py` in your project:
   ```python
   import pymysql
   pymysql.install_as_MySQLdb()
   ```

### CORS Issues

If frontend can't connect to backend:

1. Verify backend is running on port 8000
2. Check CORS settings in `settings.py`
3. Ensure frontend URL is in `CORS_ALLOWED_ORIGINS`

## Development

### Run Tests
```bash
python manage.py test
```

### Create New Migrations
```bash
python manage.py makemigrations
```

### Apply Migrations
```bash
python manage.py migrate
```

### Access Admin Panel
Navigate to `http://localhost:8000/admin/` and login with superuser credentials.

## Security Notes

- Never commit `.env` file to version control
- Change default secret keys in production
- Use HTTPS in production
- Set `DEBUG=False` in production
- Use strong passwords for database users
- Regularly update dependencies

## Tech Stack

- Django 4.2.7
- Django REST Framework 3.14.0
- MySQL Client 2.2.0
- django-cors-headers 4.3.1
- PyJWT 2.8.0
- python-decouple 3.8

## Support

For issues or questions, please create an issue in the repository.

