# BlockShare Complete Setup Instructions

This guide will help you set up the complete BlockShare application with authentication.

## 🎯 What's New

1. **Login/Register Page** - Users must authenticate before accessing the main application
2. **Django Backend** - Complete REST API with MySQL database
3. **JWT Authentication** - Secure token-based authentication
4. **Password Validation** - Strong password requirements with validation

## 📋 Prerequisites

- **Node.js** 14+ and npm
- **Python** 3.8+
- **MySQL** 5.7+ or 8.0+
- **MetaMask** browser extension
- **Git** (if cloning the repository)

## 🚀 Quick Start

### Step 1: Setup MySQL Database

1. Open MySQL command line or MySQL Workbench
2. Create the database:
```sql
CREATE DATABASE blockshare_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

### Step 2: Setup Django Backend

1. Navigate to backend folder:
```bash
cd backend
```

2. Create and activate virtual environment:
```bash
# Create virtual environment
python -m venv venv

# Activate (Windows PowerShell)
venv\Scripts\Activate.ps1

# OR Activate (Windows CMD)
venv\Scripts\activate.bat

# OR Activate (Linux/Mac)
source venv/bin/activate
```

3. Install Python dependencies:
```bash
pip install -r requirements.txt
```

4. Create `.env` file in backend folder with your MySQL credentials:
```env
# Django Settings
SECRET_KEY=your-django-secret-key-here
DEBUG=True

# Database Configuration
DB_NAME=blockshare_db
DB_USER=root
DB_PASSWORD=YOUR_MYSQL_PASSWORD
DB_HOST=localhost
DB_PORT=3306

# JWT Configuration
JWT_SECRET_KEY=your-jwt-secret-key-here
```

**Important:** Replace `YOUR_MYSQL_PASSWORD` with your actual MySQL password!

5. Run database migrations:
```bash
python manage.py makemigrations
python manage.py migrate
```

6. Start Django server:
```bash
python manage.py runserver 8000
```

Leave this terminal running!

### Step 3: Setup React Frontend

1. Open a **NEW terminal** window
2. Navigate to client folder:
```bash
cd client
```

3. Install dependencies (if not already done):
```bash
npm install
```

4. Start React development server:
```bash
npm start
```

The application should open automatically at `http://localhost:3000`

### Step 4: Setup Hardhat Blockchain (Optional for later)

1. Open a **THIRD terminal** window
2. Navigate to project root
3. Install dependencies:
```bash
npm install
```

4. Start local blockchain:
```bash
npx hardhat node
```

5. Deploy contract (in a fourth terminal):
```bash
npx hardhat run scripts/deploy.js --network localhost
```

## 🔐 Using the Application

### First Time Setup

1. **Open Browser** - Navigate to `http://localhost:3000`
2. **Register Account**
   - Click "Register here" link
   - Enter username (3+ characters)
   - Enter valid email address
   - Create password (must include: uppercase, lowercase, number, 6+ characters)
   - Confirm password
   - Click "Register"

3. **Automatic Login** - After registration, you'll be automatically logged in

4. **Connect MetaMask Wallet**
   - Click "Connect Wallet" button
   - Approve MetaMask connection
   - Switch to Hardhat network if prompted

5. **Start Using BlockShare**
   - Upload files
   - View gallery
   - Share access with others

### Subsequent Logins

1. Navigate to `http://localhost:3000`
2. Enter email and password
3. Click "Login"
4. Connect MetaMask wallet
5. Access your files

## 🔧 Troubleshooting

### Backend Issues

**MySQL Connection Error:**
```
Error: Can't connect to MySQL server
```
**Solution:**
- Verify MySQL is running
- Check username/password in `.env`
- Ensure database `blockshare_db` exists

**mysqlclient Installation Error (Windows):**
```
Error: Microsoft Visual C++ 14.0 is required
```
**Solution:**
1. Install Microsoft C++ Build Tools from: https://visualstudio.microsoft.com/visual-cpp-build-tools/
2. OR use PyMySQL alternative:
   ```bash
   pip install pymysql
   ```
   Then add to `backend/blockshare/__init__.py`:
   ```python
   import pymysql
   pymysql.install_as_MySQLdb()
   ```

**Port 8000 Already in Use:**
```bash
python manage.py runserver 8001
```
Then update frontend to use port 8001 in API calls.

### Frontend Issues

**Cannot connect to backend:**
- Verify backend is running on `http://localhost:8000`
- Check browser console for CORS errors
- Ensure both frontend and backend are running

**Registration/Login fails:**
- Check backend terminal for error messages
- Verify database connection
- Check password meets requirements

**React app won't start:**
```bash
# Clear node modules and reinstall
rm -rf node_modules package-lock.json
npm install
npm start
```

### MetaMask Issues

**Wrong Network:**
- The app will prompt you to switch to Hardhat Localhost
- Approve the network switch in MetaMask

**Can't add Hardhat network:**
- Manually add network in MetaMask:
  - Network Name: Hardhat Localhost 8545
  - RPC URL: http://127.0.0.1:8545
  - Chain ID: 31337
  - Currency Symbol: ETH

## 📊 API Endpoints

### Register
```
POST http://localhost:8000/api/register/
Content-Type: application/json

{
  "username": "johndoe",
  "email": "john@example.com",
  "password": "SecurePass123"
}
```

### Login
```
POST http://localhost:8000/api/login/
Content-Type: application/json

{
  "email": "john@example.com",
  "password": "SecurePass123"
}
```

### Verify Token
```
GET http://localhost:8000/api/verify-token/
Authorization: Bearer YOUR_JWT_TOKEN
```

## 🔒 Security Features

### Password Requirements
- ✅ Minimum 6 characters
- ✅ At least one uppercase letter
- ✅ At least one lowercase letter  
- ✅ At least one number

### Validation Features
- Email format validation
- Username uniqueness check
- Password strength validation
- JWT token expiration (24 hours)
- CORS protection
- SQL injection prevention

## 🗄️ Database Schema

The backend creates a `users` table with the following structure:

| Column | Type | Description |
|--------|------|-------------|
| id | BIGINT | Primary key, auto-increment |
| username | VARCHAR(150) | Unique username |
| email | VARCHAR(255) | Unique email address |
| password | VARCHAR(255) | Hashed password (PBKDF2) |
| is_active | BOOLEAN | Account active status |
| created_at | DATETIME | Registration timestamp |
| updated_at | DATETIME | Last update timestamp |
| last_login | DATETIME | Last login timestamp |

## 📁 Project Structure

```
Dgdrive3.0-main/
├── backend/                 # Django backend
│   ├── authentication/      # Auth app with models, views
│   ├── blockshare/         # Django project settings
│   ├── manage.py           # Django management script
│   ├── requirements.txt    # Python dependencies
│   └── README.md           # Backend documentation
│
├── client/                  # React frontend
│   ├── src/
│   │   ├── components/
│   │   │   ├── Login.js        # Login component
│   │   │   ├── Register.js     # Register component
│   │   │   ├── Login.css       # Auth styling
│   │   │   ├── Navbar.js       # Navigation with logout
│   │   │   ├── FileUpload.js   # File upload
│   │   │   └── Display.js      # File gallery
│   │   ├── App.js          # Main app with routing
│   │   └── index.js        # Entry point
│   └── package.json        # Node dependencies
│
├── contracts/              # Solidity smart contracts
├── scripts/               # Deployment scripts
└── hardhat.config.js     # Hardhat configuration
```

## 🎓 Usage Flow

1. **User Registration** → Django validates → Creates user in MySQL → Generates JWT token
2. **User Login** → Django verifies credentials → Returns JWT token
3. **Access Dashboard** → Frontend checks token → Shows main app
4. **Connect Wallet** → MetaMask integration → Blockchain access
5. **Upload Files** → IPFS/Pinata → Blockchain storage
6. **View Files** → Smart contract → Display gallery

## ⚙️ Configuration Files

### Backend Configuration
- `backend/.env` - Database and secret keys
- `backend/blockshare/settings.py` - Django settings
- `backend/requirements.txt` - Python packages

### Frontend Configuration  
- `client/package.json` - Node packages
- `client/src/App.js` - Route configuration
- `client/.env` - Contract address (optional)

## 🆘 Getting Help

If you encounter issues:

1. **Check terminal output** for error messages
2. **Verify all services are running**:
   - Django backend on port 8000
   - React frontend on port 3000
   - MySQL database service
3. **Check browser console** for frontend errors
4. **Review this guide** for troubleshooting steps

## 📝 Notes

- Keep all three terminals running (Backend, Frontend, Hardhat)
- Never commit `.env` files to version control
- Use strong passwords for production
- Change default secret keys for production deployment
- The frontend automatically saves authentication state in localStorage
- JWT tokens expire after 24 hours (configurable in settings)

## 🎉 Success!

If everything is set up correctly, you should:
1. See the login page at `http://localhost:3000`
2. Be able to register a new account
3. Automatically login after registration
4. Connect your MetaMask wallet
5. Access the file upload and gallery features

Happy coding! 🚀

