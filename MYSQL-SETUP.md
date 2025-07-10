# 🗄️ MySQL Database Setup Guide

## **Step 1: Install MySQL (if not already installed)**

### **Windows:**
1. Download MySQL Installer from: https://dev.mysql.com/downloads/installer/
2. Run the installer and follow the setup wizard
3. Remember the root password you set during installation

### **macOS:**
```bash
brew install mysql
brew services start mysql
```

### **Linux (Ubuntu/Debian):**
```bash
sudo apt update
sudo apt install mysql-server
sudo mysql_secure_installation
```

## **Step 2: Create the Database**

### **Option A: Using MySQL Command Line**
```bash
mysql -u root -p
```
Then run the SQL commands from `setup-database.sql`

### **Option B: Using phpMyAdmin**
1. Open phpMyAdmin in your browser
2. Click "New" to create a new database
3. Name it: `trainer_timetable`
4. Click "Create"
5. Select the database and go to "SQL" tab
6. Copy and paste the contents of `setup-database.sql`

### **Option C: Using MySQL Workbench**
1. Open MySQL Workbench
2. Connect to your MySQL server
3. Create a new query
4. Copy and paste the contents of `setup-database.sql`
5. Execute the query

## **Step 3: Create .env File**

Create a file named `.env` in the `server/` directory with this content:

```env
# Database Configuration
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_mysql_root_password
DB_NAME=trainer_timetable
DB_PORT=3306

# JWT Configuration
JWT_SECRET=your_super_secret_jwt_key_here

# Server Configuration
PORT=5000
```

**Replace `your_mysql_root_password` with the password you set during MySQL installation.**

## **Step 4: Test the Connection**

1. Start the server:
   ```bash
   cd Trainer-Timetable-App/server
   npm start
   ```

2. You should see:
   ```
   ✅ Connected to MySQL database successfully!
   🚀 Server running on http://localhost:5000
   ```

## **Step 5: Test Registration**

1. Go to http://localhost:3000
2. Click "Register"
3. Fill in the form and submit
4. You should see "User registered successfully ✅"

## **Troubleshooting**

### **"Access denied for user 'root'@'localhost'"**
- Check your MySQL root password in the `.env` file
- Make sure MySQL is running
- Try connecting manually: `mysql -u root -p`

### **"Unknown database 'trainer_timetable'"**
- Run the SQL script from `setup-database.sql`
- Make sure the database name matches in `.env`

### **"Connection refused"**
- Make sure MySQL service is running
- Check if MySQL is listening on port 3306

### **"Port 5000 already in use"**
- Kill the process using port 5000 or change the port in `.env`

## **Default Admin Account**

After setup, you can login with:
- **Email:** admin@example.com
- **Password:** admin123

## **Need Help?**

If you're still having issues:
1. Check the server console for error messages
2. Verify MySQL is running: `mysql -u root -p`
3. Test database connection manually
4. Make sure all required tables exist 