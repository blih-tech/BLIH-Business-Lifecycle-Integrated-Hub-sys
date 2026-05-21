# BLIH HR Module - Reporting Documentation

**Purpose:** Analytics and reporting guide for HR module  
**Audience:** HR Analysts, Business Intelligence Teams, Management  
**Version:** 1.0 | February 2026

---

## Table of Contents

1. [Reporting Overview](#1-reporting-overview)
2. [Report Categories](#2-report-categories)
3. [Attendance Reports](#3-attendance-reports)
4. [Leave Analytics](#4-leave-analytics)
5. [Performance Reports](#5-performance-reports)
6. [Recruitment Metrics](#6-recruitment-metrics)
7. [Employee Analytics](#7-employee-analytics)
8. [Compliance Reports](#8-compliance-reports)
9. [Custom Reports](#9-custom-reports)
10. [Data Export](#10-data-export)
11. [Dashboard Configuration](#11-dashboard-configuration)

---

## 1. Reporting Overview

### 1.1 Report Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                 BLIH HR Reporting Engine                │
├─────────────────────────────────────────────────────────────┤
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐ │
│  │   Data      │  │  Analytics  │  │  Export     │ │
│  │ Warehouse   │  │   Engine    │  │   Engine    │ │
│  └─────────────┘  └─────────────┘  └─────────────┘ │
│         │                 │                 │        │
│  ┌──────▼──────┐   ┌─────▼──────┐   ┌────▼──────┐ │
│  │ Attendance  │   │ Performance │   │ Compliance│ │
│  │ Reports    │   │ Analytics   │   │ Reports   │ │
│  └─────────────┘   └─────────────┘   └─────────────┘ │
└─────────────────────────────────────────────────────────────┘
```

### 1.2 Data Freshness

| Report Type | Data Refresh         | Latency      |
| ----------- | -------------------- | ------------ |
| Real-time   | Continuous           | < 1 minute   |
| Daily       | 2:00 AM local        | < 5 minutes  |
| Weekly      | Monday 6:00 AM       | < 10 minutes |
| Monthly     | 1st of month 8:00 AM | < 30 minutes |

### 1.3 Access Control

| Report Category | Default Access                           | Can Override |
| --------------- | ---------------------------------------- | ------------ |
| Attendance      | Employee (own), Manager (team), HR (all) | Yes          |
| Leave           | Employee (own), Manager (team), HR (all) | Yes          |
| Performance     | Manager (team), HR (all)                 | Yes          |
| Recruitment     | HR, Hiring Managers                      | Yes          |
| Compensation    | HR, Finance                              | No (strict)  |
| Compliance      | HR, Compliance Officers                  | No (strict)  |

---

## 2. Report Categories

### 2.1 Standard Reports

| Category        | Reports                                           | Frequency                     | Audience |
| --------------- | ------------------------------------------------- | ----------------------------- | -------- |
| **Attendance**  | Daily, Weekly, Monthly, Pattern Analysis          | Managers, HR                  |
| **Leave**       | Balance, Utilization, Forecast, Calendar          | Employees, Managers, HR       |
| **Performance** | Review Status, Rating Distribution, Goal Progress | Managers, HR, Executives      |
| **Recruitment** | Pipeline, Time-to-Hire, Source Effectiveness      | HR, Hiring Managers           |
| **Employee**    | Headcount, Turnover, Demographics, Tenure         | HR, Executives                |
| **Compliance**  | Audit Trail, Access Reviews, Policy Adherence     | Compliance Officers, Auditors |

### 2.2 Report Formats

| Format                    | Use Case             | Features                                |
| ------------------------- | -------------------- | --------------------------------------- |
| **Interactive Dashboard** | Real-time monitoring | Drilling, filtering, export             |
| **PDF Report**            | Formal presentations | Branded, printable, signatures          |
| **Excel Workbook**        | Data analysis        | Multiple sheets, formulas, pivot tables |
| **CSV Export**            | System integration   | Raw data, bulk processing               |
| **JSON API**              | Custom applications  | Real-time data, programmatic access     |

---

## 3. Attendance Reports

### 3.1 Daily Attendance Register

**Purpose:** Record of daily attendance for all employees

**API Endpoint:** `GET /api/v1/hr/reports/attendance/daily`

**Parameters:**

```json
{
  "date": "2026-02-15",
  "department": "engineering", // optional
  "includeInactive": false
}
```

**Sample Output:**

```json
{
  "reportDate": "2026-02-15",
  "summary": {
    "totalEmployees": 150,
    "present": 142,
    "absent": 3,
    "late": 5,
    "onLeave": 8,
    "attendanceRate": 94.7
  },
  "details": [
    {
      "employeeId": "EMP1001",
      "name": "John Doe",
      "department": "Engineering",
      "checkIn": "08:45",
      "checkOut": "17:30",
      "workedHours": 8.75,
      "status": "PRESENT",
      "overtimeHours": 0.5
    }
  ]
}
```

### 3.2 Monthly Attendance Summary

**Purpose:** Monthly attendance trends and patterns

**Key Metrics:**

- Attendance rate by department
- Late arrival patterns
- Overtime analysis
- Absenteeism trends
- Day-wise attendance distribution

**Visualization Examples:**

```javascript
// Attendance trend chart
const attendanceTrend = {
  type: 'line',
  data: {
    labels: ['Week 1', 'Week 2', 'Week 3', 'Week 4'],
    datasets: [
      {
        label: 'Attendance Rate %',
        data: [95.2, 94.8, 96.1, 95.5],
        borderColor: '#10B981',
        backgroundColor: 'rgba(16, 185, 129, 0.1)',
      },
    ],
  },
};

// Department comparison
const departmentComparison = {
  type: 'bar',
  data: {
    labels: ['Engineering', 'Sales', 'Operations', 'HR'],
    datasets: [
      {
        label: 'Attendance Rate %',
        data: [96.2, 94.5, 95.8, 97.1],
        backgroundColor: ['#3B82F6', '#EF4444', '#10B981', '#F59E0B'],
      },
    ],
  },
};
```

### 3.3 Pattern Analysis Report

**Purpose:** Identify attendance patterns and anomalies

**Analysis Dimensions:**

- Day of week patterns
- Late arrival frequency
- Early departure trends
- Overtime patterns by role
- Seasonal variations

**Sample Insights:**

```json
{
  "patterns": {
    "mostLateDay": "Monday",
    "latePercentage": {
      "Monday": 12.5,
      "Tuesday": 8.2,
      "Wednesday": 6.1,
      "Thursday": 5.8,
      "Friday": 4.2
    },
    "peakOvertimeDay": "Thursday",
    "averageOvertimeByRole": {
      "Developer": 2.5,
      "Manager": 1.8,
      "Support": 3.2
    },
    "absenteeismTrend": "increasing", // decreasing, stable, increasing
    "seasonalVariation": {
      "Q1": 94.2,
      "Q2": 95.8,
      "Q3": 96.1,
      "Q4": 93.5
    }
  }
}
```

---

## 4. Leave Analytics

### 4.1 Leave Balance Report

**Purpose:** Current leave balances across all leave types

**API Endpoint:** `GET /api/v1/hr/reports/leave/balances`

**Sample Output:**

```json
{
  "asOfDate": "2026-02-15",
  "summary": {
    "totalEmployees": 150,
    "totalAnnualLeaveDays": 3000,
    "totalUsedDays": 750,
    "totalAvailableDays": 2250,
    "utilizationRate": 25.0
  },
  "byDepartment": [
    {
      "department": "Engineering",
      "employees": 50,
      "totalBalance": 750,
      "averageBalance": 15.0,
      "utilizationRate": 28.5
    }
  ],
  "byLeaveType": {
    "ANNUAL": {
      "entitled": 20.0,
      "used": 5.0,
      "available": 15.0,
      "utilization": 25.0
    },
    "SICK": {
      "entitled": 10.0,
      "used": 1.5,
      "available": 8.5,
      "utilization": 15.0
    }
  }
}
```

### 4.2 Leave Utilization Report

**Purpose:** Analyze leave usage patterns and trends

**Key Metrics:**

- Leave utilization by department
- Monthly leave trends
- Leave type distribution
- Peak leave periods
- Leave balance forecasting

**Forecasting Logic:**

```javascript
const forecastLeaveBalance = (employeeId, monthsAhead) => {
  const currentBalance = getCurrentLeaveBalance(employeeId);
  const historicalUsage = getHistoricalUsage(employeeId, 12); // months

  // Calculate average monthly usage
  const avgMonthlyUsage =
    historicalUsage.reduce((sum, month) => sum + month.totalDays, 0) / 12;

  // Project future balance
  const projectedBalance = [];
  let balance = currentBalance.available;

  for (let i = 1; i <= monthsAhead; i++) {
    // Apply monthly accrual
    balance += 1.67; // Monthly accrual rate

    // Apply projected usage with seasonal adjustment
    const seasonalFactor = getSeasonalFactor(i);
    const projectedUsage = avgMonthlyUsage * seasonalFactor;
    balance = Math.max(0, balance - projectedUsage);

    projectedBalance.push({
      month: addMonths(new Date(), i),
      projectedBalance: Math.round(balance * 10) / 10,
      projectedUsage: Math.round(projectedUsage * 10) / 10,
    });
  }

  return projectedBalance;
};
```

### 4.3 Leave Calendar Report

**Purpose:** Visual representation of team leave schedules

**Features:**

- Heat map showing leave density
- Department-wise leave calendars
- Conflict identification
- Coverage analysis

---

## 5. Performance Reports

### 5.1 Review Status Dashboard

**Purpose:** Track performance review completion rates

**Metrics:**

- Self-assessment completion rate
- Manager review completion rate
- Overdue reviews by department
- Average time to complete reviews

**API Response:**

```json
{
  "period": "2024-Q4",
  "overallStatus": {
    "totalEmployees": 150,
    "selfAssessmentsCompleted": 135,
    "managerReviewsCompleted": 120,
    "completionRate": 80.0,
    "overdueCount": 15
  },
  "byDepartment": [
    {
      "department": "Engineering",
      "employees": 50,
      "completed": 45,
      "completionRate": 90.0,
      "overdue": 3
    }
  ],
  "timeline": [
    {
      "date": "2024-12-01",
      "selfAssessmentsDue": 150,
      "selfAssessmentsCompleted": 0,
      "managerReviewsCompleted": 0
    },
    {
      "date": "2024-12-15",
      "selfAssessmentsDue": 150,
      "selfAssessmentsCompleted": 120,
      "managerReviewsCompleted": 45
    }
  ]
}
```

### 5.2 Performance Distribution Analysis

**Purpose:** Analyze rating distributions and patterns

**Visualizations:**

- Rating distribution histogram
- Department comparison charts
- Rating trends over time
- High/low performer identification

**Sample Analysis:**

```json
{
  "ratingDistribution": {
    "OUTSTANDING": 15, // 10%
    "EXCEEDS_EXPECTATIONS": 30, // 20%
    "MEETS_EXPECTATIONS": 75, // 50%
    "BELOW_EXPECTATIONS": 25, // 16.7%
    "UNSATISFACTORY": 5 // 3.3%
  },
  "departmentAverages": {
    "Engineering": 3.8,
    "Sales": 3.6,
    "Operations": 3.7,
    "HR": 3.9
  },
  "trends": {
    "averageRating": {
      "Q1": 3.5,
      "Q2": 3.6,
      "Q3": 3.7,
      "Q4": 3.8
    },
    "improvementRate": 8.6 // % improvement year-over-year
  }
}
```

### 5.3 OKR Progress Report

**Purpose:** Track objective and key results achievement

**Metrics:**

- OKR completion rate
- KR achievement distribution
- Progress by department
- Alignment score

---

## 6. Recruitment Metrics

### 6.1 Recruitment Pipeline Report

**Purpose:** Track candidates through recruitment stages

**Funnel Stages:**

1. Applied → 2. Screened → 3. Interview → 4. Assessment → 5. Offer → 6. Hired

**Conversion Metrics:**

```json
{
  "period": "2024-Q4",
  "pipeline": {
    "applied": 500,
    "screened": 200, // 40% conversion
    "interviewed": 80, // 40% conversion
    "assessed": 40, // 50% conversion
    "offered": 20, // 50% conversion
    "hired": 12 // 60% conversion
  },
  "conversionRates": {
    "screenToInterview": 40.0,
    "interviewToAssessment": 50.0,
    "assessmentToOffer": 50.0,
    "offerToHire": 60.0,
    "overallConversion": 2.4 // Applied to Hired
  },
  "timeMetrics": {
    "averageTimeToHire": 45, // days
    "timeInEachStage": {
      "screening": 3,
      "interview": 15,
      "assessment": 7,
      "offer": 5
    }
  }
}
```

### 6.2 Source Effectiveness Report

**Purpose:** Analyze recruitment channel performance

**Channels:**

- Company website
- Job boards (LinkedIn, Indeed)
- Employee referrals
- Recruitment agencies
- Campus recruitment
- Social media

**Effectiveness Metrics:**

- Cost per hire
- Quality of hire (performance ratings)
- Time to fill
- Retention rate

---

## 7. Employee Analytics

### 7.1 Headcount Report

**Purpose:** Track employee numbers and composition

**Dimensions:**

- By department
- By employment type
- By location
- By tenure band
- By gender/age (demographics)

**Sample Output:**

```json
{
  "asOfDate": "2026-02-15",
  "totalHeadcount": 150,
  "byDepartment": {
    "Engineering": 50,
    "Sales": 35,
    "Operations": 30,
    "HR": 10,
    "Finance": 15,
    "Admin": 10
  },
  "byEmploymentType": {
    "FULL_TIME": 120,
    "PART_TIME": 20,
    "CONTRACT": 8,
    "INTERN": 2
  },
  "byTenure": {
    "0-6 months": 15,
    "6-12 months": 20,
    "1-2 years": 35,
    "2-5 years": 50,
    "5+ years": 30
  }
}
```

### 7.2 Turnover Analysis

**Purpose:** Analyze employee turnover rates and patterns

**Key Metrics:**

- Monthly turnover rate
- Voluntary vs involuntary turnover
- Turnover by department
- Turnover by tenure
- Exit reason analysis

**Turnover Calculation:**

```javascript
const calculateTurnoverRate = (period) => {
  const startHeadcount = getHeadcount(period.startDate);
  const endHeadcount = getHeadcount(period.endDate);
  const separations = getSeparations(period);

  const averageHeadcount = (startHeadcount + endHeadcount) / 2;
  const turnoverRate = (separations / averageHeadcount) * 100;

  return {
    period,
    startHeadcount,
    endHeadcount,
    separations,
    averageHeadcount,
    turnoverRate: Math.round(turnoverRate * 100) / 100,
  };
};
```

---

## 8. Compliance Reports

### 8.1 Audit Trail Report

**Purpose:** Complete audit log for compliance verification

**Filtering Options:**

- Date range
- User/Department
- Action type
- Module
- Data sensitivity level

**Sample Export:**

```csv
Timestamp,User,Email,Action,Module,Resource,IP Address,User Agent
2026-02-15 08:45:00,John Doe,john@company.com,employee.update,HR,EMP1001,192.168.1.100,Mozilla/5.0...
2026-02-15 09:00:00,Jane Smith,jane@company.com,leave.approve,HR,REQ-001,192.168.1.101,Mozilla/5.0...
```

### 8.2 Access Review Report

**Purpose:** Document access certification activities

**Content:**

- Review campaign details
- Certifications completed
- Access changes made
- Outstanding items
- Reviewer attestations

### 8.3 Data Protection Report

**Purpose:** GDPR and data privacy compliance

**Metrics:**

- Data processing activities
- Consent records
- Data subject requests
- Data breach incidents
- Retention compliance

---

## 9. Custom Reports

### 9.1 Report Builder

**Features:**

- Drag-and-drop interface
- Custom field selection
- Filter configuration
- Calculation formulas
- Visualization options

**Building Blocks:**

- Data sources (tables, views)
- Fields and aggregations
- Filters and parameters
- Calculations and KPIs
- Charts and tables

### 9.2 Scheduled Reports

**Configuration:**

```json
{
  "reportId": "custom-attendance-summary",
  "schedule": {
    "frequency": "weekly", // daily, weekly, monthly, quarterly
    "dayOfWeek": 1, // Monday
    "time": "06:00",
    "timezone": "Africa/Addis_Ababa"
  },
  "delivery": {
    "email": ["manager@company.com", "hr@company.com"],
    "format": "pdf",
    "includeRawData": false
  },
  "retention": {
    "keepHistory": 12, // months
    "archiveLocation": "s3://reports-archive/"
  }
}
```

---

## 10. Data Export

### 10.1 Export Formats

| Format    | Features                          | File Size | Use Case            |
| --------- | --------------------------------- | --------- | ------------------- |
| **Excel** | Multiple sheets, formulas, charts | Medium    | Detailed analysis   |
| **CSV**   | Raw data, universal               | Small     | System integration  |
| **PDF**   | Formatted, printable, signatures  | Medium    | Presentations       |
| **JSON**  | Structured, API-ready             | Small     | Custom applications |
| **XML**   | Standardized, enterprise          | Medium    | Legacy systems      |

### 10.2 Bulk Export API

```javascript
// Initiate bulk export
const exportRequest = await fetch('/api/v1/hr/reports/export', {
  method: 'POST',
  headers: {
    Authorization: 'Bearer ' + token,
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    reportType: 'attendance_history',
    parameters: {
      startDate: '2026-01-01',
      endDate: '2026-12-31',
      format: 'excel',
      includeFields: ['employeeId', 'date', 'checkIn', 'checkOut', 'hours'],
    },
  }),
});

// Response with export job ID
const { jobId } = await exportRequest.json();

// Check export status
const checkStatus = async () => {
  const status = await fetch(`/api/v1/hr/reports/export/${jobId}/status`);
  const { status, downloadUrl, progress } = await status.json();

  if (status === 'completed') {
    window.open(downloadUrl);
  } else if (status === 'failed') {
    console.error('Export failed');
  } else {
    setTimeout(checkStatus, 5000); // Check again in 5 seconds
  }
};

checkStatus();
```

### 10.3 Export Limits

| User Type    | Concurrent Exports | Max Records | Retention |
| ------------ | ------------------ | ----------- | --------- |
| Employee     | 1                  | 10,000      | 7 days    |
| Manager      | 2                  | 50,000      | 14 days   |
| HR Admin     | 5                  | 500,000     | 30 days   |
| System Admin | 10                 | Unlimited   | 90 days   |

---

## 11. Dashboard Configuration

### 11.1 Pre-built Dashboards

| Dashboard                 | Audience      | Key Widgets                                            |
| ------------------------- | ------------- | ------------------------------------------------------ |
| **HR Overview**           | HR Managers   | Headcount, turnover, open positions, pending approvals |
| **Attendance Dashboard**  | Operations    | Real-time attendance, late arrivals, absenteeism       |
| **Leave Dashboard**       | All Employees | Team calendar, leave balances, utilization             |
| **Performance Dashboard** | Management    | Review status, rating distribution, goal progress      |
| **Recruitment Dashboard** | Recruiters    | Pipeline metrics, time-to-hire, source effectiveness   |

### 11.2 Custom Dashboard Builder

**Widget Types:**

- KPI cards
- Charts (line, bar, pie, gauge)
- Tables with pagination
- Heat maps
- Trend indicators
- Goal progress bars

**Layout Options:**

- Grid-based drag-and-drop
- Responsive breakpoints
- Widget sizing (small, medium, large, full-width)
- Tabbed containers

### 11.3 Real-time Updates

```javascript
// WebSocket connection for live dashboard updates
const ws = new WebSocket('wss://blih.company.com/dashboard/updates');

ws.on('message', (event) => {
  const update = JSON.parse(event.data);

  switch (update.type) {
    case 'attendance_update':
      updateAttendanceWidget(update.data);
      break;
    case 'leave_approved':
      updateLeaveWidget(update.data);
      break;
    case 'performance_review_submitted':
      updatePerformanceWidget(update.data);
      break;
  }
});
```

---

## Performance Optimization

### 11.1 Query Optimization

- Indexed fields for fast filtering
- Aggregated tables for summary reports
- Caching for frequently accessed data
- Query timeout limits

### 11.2 Caching Strategy

| Data Type       | Cache Duration | Invalidation         |
| --------------- | -------------- | -------------------- |
| Employee master | 24 hours       | On employee update   |
| Attendance data | 1 hour         | On new attendance    |
| Leave balances  | 30 minutes     | On leave transaction |
| Report results  | 15 minutes     | On data change       |

---

_Reporting Guide Version: 1.0_  
_Last Updated: February 2026_  
_For reporting support: reports@blih.com_
