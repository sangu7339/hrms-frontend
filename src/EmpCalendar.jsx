import { useEffect, useState } from "react";
import axios from "axios";
import "./EmployeeHolidayCalendar.css";

export default function EmployeeHolidayCalendar() {
  const [holidays, setHolidays] = useState([]);
  const [types, setTypes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [viewMode, setViewMode] = useState("calendar");
  const [currentMonth, setCurrentMonth] = useState(new Date());

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
  setLoading(true);
  setError("");

  try {
    const [holidayRes, typeRes] = await Promise.all([
      axios.get(`/api/hr/holiday`, { withCredentials: true }),
      axios.get(`/api/hr/holidaymaster`, { withCredentials: true })
    ]);

    // ✅ SAFE ARRAY CHECK
    const holidayData = Array.isArray(holidayRes.data)
      ? holidayRes.data
      : [];

    const typeData = Array.isArray(typeRes.data)
      ? typeRes.data
      : [];

    if (!Array.isArray(holidayRes.data)) {
      console.error("Invalid holiday response:", holidayRes.data);
    }

    if (!Array.isArray(typeRes.data)) {
      console.error("Invalid holiday type response:", typeRes.data);
    }

    setHolidays(holidayData);
    setTypes(typeData);

  } catch (err) {
    console.error("Error loading data:", err);
    setError("Failed to load holiday data. Please try again.");
  } finally {
    setLoading(false);
  }
};

  const getTypeName = (id) => {
    if (!id && id !== 0) return "Not Selected";
    
    const type = types.find(t => {
      const tId = t.htId || t.id || t.typeId;
      return String(tId).toLowerCase() === String(id).toLowerCase();
    });
    
    return type ? (type.holidayType || type.type || "Unknown") : "Unknown";
  };

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-US', {
        weekday: 'short',
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      });
    } catch (e) {
      return String(dateString);
    }
  };

  const sortedHolidays = [...holidays].sort((a, b) => {
    const dateA = new Date(a.holidayDate || a.date);
    const dateB = new Date(b.holidayDate || b.date);
    return dateA - dateB;
  });

  // Calendar functions
  const getDaysInMonth = (date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    return new Date(year, month + 1, 0).getDate();
  };

  const getFirstDayOfMonth = (date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    return new Date(year, month, 1).getDay();
  };

  const getMonthName = (date) => {
    return date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
  };

  const navigateMonth = (direction) => {
    const newMonth = new Date(currentMonth);
    newMonth.setMonth(newMonth.getMonth() + direction);
    setCurrentMonth(newMonth);
  };

  // Get holidays for a specific day
  const getHolidaysForDay = (day) => {
    const targetYear = currentMonth.getFullYear();
    const targetMonth = currentMonth.getMonth() + 1;
    const targetDay = day;
    
    return sortedHolidays.filter(h => {
      const holidayDate = h.holidayDate || h.date;
      
      if (!holidayDate) return false;
      
      try {
        const date = new Date(holidayDate);
        
        if (isNaN(date.getTime())) {
          console.warn('Invalid date:', holidayDate);
          return false;
        }
        
        return date.getFullYear() === targetYear && 
               date.getMonth() + 1 === targetMonth && 
               date.getDate() === targetDay;
      } catch (e) {
        console.warn('Error parsing date:', holidayDate, e);
        return false;
      }
    });
  };

  // Get holidays for current month
  const getHolidaysByMonth = () => {
    const currentYear = currentMonth.getFullYear();
    const currentMonthNum = currentMonth.getMonth() + 1;
    
    return sortedHolidays.filter(h => {
      const holidayDate = h.holidayDate || h.date;
      if (!holidayDate) return false;
      
      try {
        const date = new Date(holidayDate);
        if (isNaN(date.getTime())) return false;
        
        return date.getFullYear() === currentYear && 
               date.getMonth() + 1 === currentMonthNum;
      } catch (e) {
        return false;
      }
    });
  };

  // Render calendar view
  const renderCalendar = () => {
    const daysInMonth = getDaysInMonth(currentMonth);
    const firstDay = getFirstDayOfMonth(currentMonth);
    const monthHolidays = getHolidaysByMonth();
    
    const days = [];
    
    // Empty cells for days before the first day of month
    for (let i = 0; i < firstDay; i++) {
      days.push(<div key={`empty-${i}`} className="calendar-day empty"></div>);
    }
    
    // Days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      const dayHolidays = getHolidaysForDay(day);
      const isToday = new Date().getDate() === day && 
                     new Date().getMonth() === currentMonth.getMonth() && 
                     new Date().getFullYear() === currentMonth.getFullYear();
      
      days.push(
        <div key={`day-${day}`} className={`calendar-day ${dayHolidays.length > 0 ? 'has-holiday' : ''} ${isToday ? 'today' : ''}`}>
          <div className="day-number">{day}</div>
          {dayHolidays.length > 0 && (
            <div className="holiday-indicators">
              <div className="holiday-count">{dayHolidays.length} holiday{dayHolidays.length !== 1 ? 's' : ''}</div>
              <div className="holiday-tooltip">
                {dayHolidays.map((h, idx) => {
                  const typeName = getTypeName(h.holidayTypeId || h.typeId);
                  return (
                    <div key={idx} className="holiday-tooltip-item">
                      <div className="holiday-tooltip-header">
                        <span className="holiday-name">{h.holidayName || h.name}</span>
                      </div>
                      <div className="holiday-tooltip-details">
                        <span className="holiday-type">{typeName}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      );
    }
    
    return (
      <div className="calendar-view">
        <div className="calendar-header">
          <button onClick={() => navigateMonth(-1)} className="calendar-nav-btn">
            &larr; Previous
          </button>
          <h3 className="calendar-month-title">{getMonthName(currentMonth)}</h3>
          <button onClick={() => navigateMonth(1)} className="calendar-nav-btn">
            Next &rarr;
          </button>
        </div>
        
        <div className="calendar-days-header">
          {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
            <div key={day} className="calendar-day-header">{day}</div>
          ))}
        </div>
        
        <div className="calendar-grid">
          {days}
        </div>
        
        {monthHolidays.length > 0 && (
          <div className="calendar-summary">
            <h4>Holidays in {getMonthName(currentMonth)}:</h4>
            <div className="month-holidays-list">
              {monthHolidays.map((h, idx) => {
                const holidayName = h.holidayName || h.name;
                const holidayDate = h.holidayDate || h.date;
                const typeName = getTypeName(h.holidayTypeId || h.typeId);
                
                return (
                  <div key={idx} className="month-holiday-item">
                    <span className="holiday-date">{formatDate(holidayDate)}</span>
                    <span className="holiday-name">{holidayName}</span>
                    <span className="holiday-type">{typeName}</span>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    );
  };

  if (loading) {
    return (
      <div className="emp-holiday-container">
        <div className="loading">
          <h2>Loading Holiday Calendar...</h2>
          <p>Fetching holiday information...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="emp-holiday-container">
        <div className="error-message">
          <h2>Error</h2>
          <p>{error}</p>
          <button onClick={loadData} className="retry-btn">
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="emp-holiday-container">
      <div className="header-section">
        <h2>Holiday Calendar</h2>
        <div className="header-info">
          <p><strong>Total Holidays:</strong> {sortedHolidays.length}</p>
          <div className="header-controls">
            <div className="view-toggle">
              <button 
                onClick={() => setViewMode("list")}
                className={`view-btn ${viewMode === "list" ? "active" : ""}`}
              >
                📋 List View
              </button>
              <button 
                onClick={() => setViewMode("calendar")}
                className={`view-btn ${viewMode === "calendar" ? "active" : ""}`}
              >
                📅 Calendar View
              </button>
            </div>
            <button onClick={loadData} className="refresh-btn">
              Refresh
            </button>
          </div>
        </div>
      </div>

      <div className="stats-section">
        <div className="stat-card">
          <span className="stat-label">Total Holidays</span>
          <span className="stat-value">{holidays.length}</span>
        </div>
        <div className="stat-card">
          <span className="stat-label">Holiday Types</span>
          <span className="stat-value">{types.length}</span>
        </div>
        <div className="stat-card">
          <span className="stat-label">Current View</span>
          <span className="stat-value">{viewMode === "calendar" ? "Calendar" : "List"}</span>
        </div>
      </div>

      {sortedHolidays.length === 0 ? (
        <div className="no-holidays">
          <h3>No Holidays Found</h3>
          <p>No holidays are scheduled at the moment.</p>
        </div>
      ) : (
        <>
          {viewMode === "calendar" ? (
            renderCalendar()
          ) : (
            <>
              <table className="emp-holiday-table">
                <thead>
                  <tr>
                    <th>#</th>
                    <th>Date</th>
                    <th>Holiday Name</th>
                    <th>Type</th>
                  </tr>
                </thead>
                <tbody>
                  {sortedHolidays.map((h, index) => {
                    const holidayId = h.holidayId || h.id || h.hId || `holiday-${index}`;
                    const holidayDate = h.holidayDate || h.date;
                    const holidayName = h.holidayName || h.name;
                    const typeId = h.holidayTypeId || h.typeId;
                    
                    return (
                      <tr key={holidayId}>
                        <td className="serial">{index + 1}</td>
                        <td className="date-cell">
                          <div className="date-display">{formatDate(holidayDate)}</div>
                        </td>
                        <td className="name-cell">
                          <strong>{holidayName}</strong>
                        </td>
                        <td className="type-cell">
                          <div className="type-display">{getTypeName(typeId)}</div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
              
              <div className="summary">
                <p>
                  Showing <strong>{sortedHolidays.length}</strong> holiday{sortedHolidays.length !== 1 ? 's' : ''}
                </p>
              </div>
            </>
          )}
        </>
      )}
    </div>
  );
}
