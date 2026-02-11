import "./TopHeader.css";

export default function TopHeader({ activePage, setActivePage }) {
  return (
    <div className="top-header-wrapper">
      {/* MAIN MENU */}
      <div className="top-main-menu">
        <span 
          className={activePage === "dashboard" ? "active" : ""}
          onClick={() => setActivePage("dashboard")}
        >
          All
        </span>
        <span 
          className={activePage === "employee" || activePage === "employee-edit" ? "active" : ""}
          onClick={() => setActivePage("employee")}
        >
          Employees
        </span>
        <span 
          className={activePage === "department" ? "active" : ""}
          onClick={() => setActivePage("department")}
        >
          Departments
        </span>
        <span 
          className={activePage === "salary-calc" ? "active" : ""}
          onClick={() => setActivePage("salary-calc")}
        >
          Salary
        </span>
        <span 
          className={activePage === "leave" ? "active" : ""}
          onClick={() => setActivePage("leave")}
        >
          Leave
        </span>
        <span 
          className={activePage === "Holiday" ? "active" : ""}
          onClick={() => setActivePage("Holiday")}
        >
          Holidays
        </span>
      </div>

      {/* SUB MENU - Only shows when relevant page is active */}
      <div className="top-sub-menu">
        {activePage === "employee" || activePage === "employee-edit" ? (
          <div className="sub-menu-items">
            <button 
              className={`sub-btn ${activePage === "employee" ? "active" : ""}`}
              onClick={() => {
                setActivePage("employee");
              }}
            >
              Add Employee
            </button>
            <button 
              className={`sub-btn ${activePage === "employee-edit" ? "active" : ""}`}
              onClick={() => {
                setActivePage("employee-edit");
              }}
            >
              Edit Employee
            </button>
          </div>
        ) : activePage === "department" ? (
          <div className="sub-menu-items">
            <button 
              className="sub-btn"
              onClick={() => {
                setActivePage("department");
                // You might want to add state to track department mode
              }}
            >
              Add Dept
            </button>
            <button 
              className="sub-btn"
              onClick={() => {
                setActivePage("department");
                // You might want to add state to track department mode
              }}
            >
              Edit Dept
            </button>
          </div>
        ) : activePage === "salary-calc" ? (
          <div className="sub-menu-items">
            <button 
              className="sub-btn"
              onClick={() => {
                setActivePage("salary-calc");
                // You might want to add state to track salary mode
              }}
            >
              Set CTC
            </button>
            <button 
              className="sub-btn"
              onClick={() => {
                setActivePage("salary-calc");
                // You might want to add state to track salary mode
              }}
            >
              Edit CTC
            </button>
          </div>
        ) : activePage === "leave" ? (
          <div className="sub-menu-items">
            <button 
              className="sub-btn active"
              onClick={() => setActivePage("leave")}
            >
              Leave Management
            </button>
          </div>
        ) : activePage === "Holiday" ? (
          <div className="sub-menu-items">
            <button 
              className="sub-btn active"
              onClick={() => setActivePage("Holiday")}
            >
              Holiday Calendar
            </button>
          </div>
        ) : null}
      </div>
    </div>
  );
}