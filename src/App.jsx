import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Login from './Login';
import ForgotPassword from './ForgotPassword';
import HrDashBoard from './HrDashBoard';
import EmpDashboard from './EmpDashboard';
import SetPassword from './SetPassword';
import HrLeaveManagement from './HrLeaveManagement';
import EmpLeaveManagement from './EmpLeaveManagement';


import HrEmployeeManagement from './HrEmployeeManagement';
import HolidayCalendar from "./HolidayCalendar";
import EmpMgr from "./EmpMgr";
function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/set-password" element={<SetPassword />} />
        <Route path="/hr-dashboard" element={<HrDashBoard />} />
        <Route path="/emp-dashboard" element={<EmpDashboard />} />
        <Route path="/hrleave-management" element={<HrLeaveManagement/>}/>
        <Route path="/empleave-management" element={<EmpLeaveManagement/>}/>
  
        
         
<Route path="/hremployee-management" element={<HrEmployeeManagement/>}/>
<Route path="/hr-holiday-calendar" element={<HolidayCalendar />} />
<Route path="/emp_mgr" element={<EmpMgr/>} />

      </Routes>
    </Router>
  );
}

export default App;

