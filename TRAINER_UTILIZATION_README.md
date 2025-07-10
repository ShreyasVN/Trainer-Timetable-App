# Trainer Utilization Report Feature

## Overview
The Trainer Utilization Report provides comprehensive analytics on trainer performance, attendance, and utilization rates. This feature is available exclusively to admin users and helps track trainer productivity and engagement.

## Features

### 1. Monthly Utilization Tracking
- View utilization data for any month and year
- Track total sessions, attended sessions, and missed sessions
- Calculate total hours worked and average hours per session

### 2. Key Metrics
- **Attendance Rate**: Percentage of sessions attended vs. total sessions
- **Utilization Rate**: Percentage of time utilized based on standard 8-hour workday (176 hours/month)
- **Status Indicators**: 
  - High (≥80% utilization)
  - Medium (60-79% utilization)
  - Low (40-59% utilization)
  - Very Low (<40% utilization)

### 3. Export Capabilities
- **CSV Export**: Download utilization data in CSV format
- **PDF Export**: Generate professional PDF reports
- Files are automatically named with month and year (e.g., `Trainer_Utilization_January_2025.csv`)

### 4. Summary Statistics
- Total number of trainers
- Average attendance rate across all trainers
- Average utilization rate across all trainers
- Total sessions conducted

## How to Access

1. **Login as Admin**: Use admin credentials to access the admin dashboard
2. **Navigate to Utilization Report**: The report appears below the sessions table
3. **Select Month/Year**: Use the dropdown selectors to view data for specific periods
4. **Export Data**: Click "Export CSV" or "Export PDF" buttons to download reports

## Data Calculation

### Utilization Rate Formula
```
Utilization Rate = (Total Hours / 176) × 100
```
Where 176 = 8 hours/day × 22 working days/month

### Attendance Rate Formula
```
Attendance Rate = (Attended Sessions / Total Sessions) × 100
```

## Sample Data
To test the feature with sample data, run the SQL commands in `sql/sample_data.sql`:

```sql
-- Insert sample trainers and sessions
-- This will create 3 trainers with various session data for testing
```

## Technical Implementation

### Frontend Components
- `TrainerUtilization.js`: Main component for displaying utilization data
- Integrated into `AdminDashboard.js` for admin access

### Backend APIs
- `GET /api/auth/users`: Fetches all users (trainers and admins)
- `GET /api/sessions`: Fetches all sessions for calculation

### Dependencies
- `axios`: API calls
- `react-toastify`: Notifications
- `jspdf` & `jspdf-autotable`: PDF generation
- `papaparse`: CSV parsing and generation

## Usage Example

1. **View Current Month**: By default, shows current month's data
2. **Change Period**: Select different month/year to view historical data
3. **Analyze Performance**: Review attendance and utilization rates
4. **Export Reports**: Download data for further analysis or reporting
5. **Identify Trends**: Compare performance across different periods

## Benefits

- **Performance Monitoring**: Track trainer productivity and attendance
- **Resource Planning**: Identify underutilized or overworked trainers
- **Quality Assurance**: Monitor attendance patterns for training quality
- **Reporting**: Generate professional reports for stakeholders
- **Data-Driven Decisions**: Make informed decisions based on utilization metrics 