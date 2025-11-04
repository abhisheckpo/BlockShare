# Quick Setup Guide

## Prerequisites
1. Python 3.8+ installed
2. MySQL 5.7+ or 8.0+ installed and running
3. MySQL credentials ready

## Step-by-Step Setup

### 1. Create Database
Open MySQL command line or MySQL Workbench and run:
```sql
CREATE DATABASE blockshare_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

### 2. Install Python Dependencies
```bash
cd backend
python -m venv venv
venv\Scripts\activate  # On Windows
pip install -r requirements.txt
```

### 3. Configure Database Connection
Create a `.env` file in the `backend` folder:
```env
DB_NAME=blockshare_db
DB_USER=root
DB_PASSWORD=YOUR_MYSQL_PASSWORD_HERE
DB_HOST=localhost
DB_PORT=3306
SECRET_KEY=your-secret-key-here
JWT_SECRET_KEY=your-jwt-secret-here
DEBUG=True
```

**Replace:**
- `YOUR_MYSQL_PASSWORD_HERE` with your actual MySQL password
- Generate random strings for SECRET_KEY and JWT_SECRET_KEY

### 4. Run Migrations
```bash
python manage.py makemigrations
python manage.py migrate
```

### 5. Start Server
```bash
python manage.py runserver 8000
```

### 6. Test the API
Open browser or Postman and test:
- Registration: POST `http://localhost:8000/api/register/`
- Login: POST `http://localhost:8000/api/login/`

## Common Issues

**MySQL Connection Failed:**
- Check MySQL service is running
- Verify username and password in .env
- Ensure database exists

**mysqlclient Installation Error:**
- Windows: Install Microsoft C++ Build Tools
- Or use: `pip install pymysql` and add to `blockshare/__init__.py`:
  ```python
  import pymysql
  pymysql.install_as_MySQLdb()
  ```

**Port Already in Use:**
- Stop other Django servers
- Or use different port: `python manage.py runserver 8001`

## Next Steps
1. Start the React frontend (see client/README.md)
2. Test login/register flow
3. Connect MetaMask wallet
4. Upload files to blockchain storage

## Need Help?
The user will provide MySQL credentials when you ask.

