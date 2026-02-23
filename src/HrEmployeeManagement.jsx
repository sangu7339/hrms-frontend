// import React, { useEffect, useState } from "react";
// import axios from "axios";
// import "./HrEmployeeManagement.css";
// function HrEmployeeManagement() {
//   const loggedInUserId = sessionStorage.getItem("userId");
//   const [loading, setLoading] = useState(false);
//   const [message, setMessage] = useState("");
//   const [mode, setMode] = useState("create");
//   const [userId, setUserId] = useState(null);
  
//   // Current step tracker
//   const [currentStep, setCurrentStep] = useState(1);
//   const totalSteps = 8;

//   // Search states
//   const [searchValue, setSearchValue] = useState("");
//   const [searchResults, setSearchResults] = useState([]);
//   const [showSearchResults, setShowSearchResults] = useState(false);
//   const [searchLoading, setSearchLoading] = useState(false);
//   const [selectedEmployee, setSelectedEmployee] = useState(null);

//   // Manager search states
//   const [managerSearchValue, setManagerSearchValue] = useState("");
//   const [managerSearchResults, setManagerSearchResults] = useState([]);
//   const [showManagerSearch, setShowManagerSearch] = useState(false);
//   const [managerSearchLoading, setManagerSearchLoading] = useState(false);
//   const [selectedManager, setSelectedManager] = useState(null);

//   // API data
//   const [departments, setDepartments] = useState([]);
//   const [designations, setDesignations] = useState([]);
//   const [percentages, setPercentages] = useState(null);
//   const [documents, setDocuments] = useState([]);

//   // Form state
//   const [form, setForm] = useState({
//     personalDetailsDTO: {
//       firstName: "", middleName: "", lastName: "", gender: "", dob: "",
//       nationality: "", maritalStatus: "", bloodGroup: "", aadhaarNumber: "",
//       panNumber: "", phoneNumber: "", emailId: "", address1: "", address2: "",
//       emergencyContactName: "", emergencyContactRelation: "", emergencyPhoneNumber: "",
//     },
//     jobDetailsDTO: {
//       departmentId: "", designationId: "", workLocation: "", dateOfJoining: "",
//     },
//     bankDetailsDTO: {
//       bankName: "", accountNumber: "", ifsc: "", branchName: "", beneficiaryName: "",
//     },
//     employeeStatutoryDetailsDTO: {
//       pfUan: "", esi: "", min: "",
//     },
//     salaryDetailsDTO: {
//       ctc: "", basic: "", hra: "", conveyanceAllowance: "", pf: "",
//     },
//     empMgrDto: {
//       mgrId: "",
//     }
//   });

//   const [netSalary, setNetSalary] = useState(0);
//   const [uploadedFiles, setUploadedFiles] = useState({});
//   const [existingDocuments, setExistingDocuments] = useState([]);
//   const [uploadingDocuments, setUploadingDocuments] = useState({});

//   // Step definitions
//   const steps = [
//     { number: 1, title: "Search Employee", icon: "🔍" },
//     { number: 2, title: "Personal Details", icon: "👤" },
//     { number: 3, title: "Contact Information", icon: "📞" },
//     { number: 4, title: "Job Details", icon: "💼" },
//     { number: 5, title: "Manager Assignment", icon: "👔" },
//     { number: 6, title: "Bank Details", icon: "🏦" },
//     { number: 7, title: "Salary & Statutory", icon: "💰" },
//     { number: 8, title: "Document Uploads", icon: "📄" }
//   ];

//   // Fetch initial data
//   useEffect(() => {
//     axios.get(`/api/departments`, { withCredentials: true })
//       .then((res) => setDepartments(res.data))
//       .catch((err) => console.error("Department API error", err));

//     axios.get(`/api/designations`, { withCredentials: true })
//       .then((res) => setDesignations(res.data))
//       .catch((err) => console.error("Designation API error", err));

//     axios.get(`/api/salary/calculator/get`, { withCredentials: true })
//       .then((res) => {
//         const validItem = Array.isArray(res.data)
//           ? res.data.find(item => item.basicPercentage > 0)
//           : res.data;
//         if (validItem) {
//           setPercentages({
//             basic: Number(validItem.basicPercentage),
//             hra: Number(validItem.hraPercentage),
//             pf: Number(validItem.pfPercentage),
//           });
//         }
//       })
//       .catch((err) => console.error("Salary percentages API error", err));

//     const documentTypes = [
//       { id: 1, documentName: "joining-letter", key: "joiningLetter", displayName: "Joining Letter", mandatory: true, fileType: "PDF", apiKey: "joining-letter" },
//       { id: 2, documentName: "resume", key: "resume", displayName: "Resume", mandatory: true, fileType: "PDF", apiKey: "resume" },
//       { id: 3, documentName: "resignation-letter", key: "resignationLetter", displayName: "Resignation Letter", mandatory: false, fileType: "PDF", apiKey: "resignation-letter" },
//       { id: 4, documentName: "offer-letter", key: "offerLetter", displayName: "Offer Letter", mandatory: true, fileType: "PDF", apiKey: "offer-letter" },
//       { id: 5, documentName: "photograph", key: "photograph", displayName: "Photograph", mandatory: true, fileType: "JPG/PNG", apiKey: "photograph" },
//     ];
//     setDocuments(documentTypes);
//   }, []);

//   // Auto-calculate salary
//   useEffect(() => {
//     if (!percentages || !form.salaryDetailsDTO.ctc) return;
//     const ctcAmount = Number(form.salaryDetailsDTO.ctc);
//     if (isNaN(ctcAmount) || ctcAmount <= 0) return;

//     const basic = (ctcAmount * percentages.basic) / 100;
//     const hra = (basic * percentages.hra) / 100;
//     const pf = (basic * percentages.pf) / 100;
//     const conveyanceAllowance = ctcAmount - (basic + hra + pf);
//     const net = ctcAmount - pf;

//     setForm(prev => ({
//       ...prev,
//       salaryDetailsDTO: {
//         ...prev.salaryDetailsDTO,
//         basic: basic.toFixed(0),
//         hra: hra.toFixed(0),
//         pf: pf.toFixed(0),
//         conveyanceAllowance: conveyanceAllowance.toFixed(0)
//       }
//     }));
//     setNetSalary(net.toFixed(0));
//   }, [form.salaryDetailsDTO.ctc, percentages]);

//   const handleChange = (section, field, value) => {
//     setForm((prev) => ({
//       ...prev,
//       [section]: { ...prev[section], [field]: value },
//     }));
//   };

//   // Navigation handlers
//   const nextStep = () => {
//     if (validateCurrentStep()) {
//       setCurrentStep(prev => Math.min(prev + 1, totalSteps));
//       window.scrollTo({ top: 0, behavior: 'smooth' });
//     }
//   };

//   const prevStep = () => {
//     setCurrentStep(prev => Math.max(prev - 1, 1));
//     window.scrollTo({ top: 0, behavior: 'smooth' });
//   };

//   const goToStep = (step) => {
//     setCurrentStep(step);
//     window.scrollTo({ top: 0, behavior: 'smooth' });
//   };

//   // Validation for current step
//   const validateCurrentStep = () => {
//     switch (currentStep) {
//       case 2: // Personal Details
//         if (!form.personalDetailsDTO.firstName || !form.personalDetailsDTO.lastName) {
//           setMessage("❌ Please enter first name and last name");
//           return false;
//         }
//         if (!form.personalDetailsDTO.gender || !form.personalDetailsDTO.dob) {
//           setMessage("❌ Please select gender and date of birth");
//           return false;
//         }
//         break;
//       case 3: // Contact Information
//         if (!form.personalDetailsDTO.phoneNumber || !form.personalDetailsDTO.emailId) {
//           setMessage("❌ Please enter phone number and email");
//           return false;
//         }
//         if (!form.personalDetailsDTO.address1) {
//           setMessage("❌ Please enter current address");
//           return false;
//         }
//         break;
//       case 4: // Job Details
//         if (!form.jobDetailsDTO.departmentId || !form.jobDetailsDTO.designationId) {
//           setMessage("❌ Please select department and designation");
//           return false;
//         }
//         if (!form.jobDetailsDTO.dateOfJoining) {
//           setMessage("❌ Please select date of joining");
//           return false;
//         }
//         break;
//       case 6: // Bank Details
//         if (!form.bankDetailsDTO.bankName || !form.bankDetailsDTO.accountNumber || !form.bankDetailsDTO.ifsc) {
//           setMessage("❌ Please fill in all bank details");
//           return false;
//         }
//         break;
//       case 7: // Salary
//         if (!form.salaryDetailsDTO.ctc || Number(form.salaryDetailsDTO.ctc) <= 0) {
//           setMessage("❌ Please enter valid CTC amount");
//           return false;
//         }
//         break;
//     }
//     setMessage("");
//     return true;
//   };

//   // Search employee
//   const handleSearch = async () => {
//     if (!searchValue.trim()) {
//       setMessage("Please enter a search term");
//       return;
//     }
//     try {
//       setSearchLoading(true);
//       setShowSearchResults(true);
//       const res = await axios.get(`/api/dept/hr/emp/search?value=${searchValue}`, { withCredentials: true });
//       const results = Array.isArray(res.data) ? res.data : res.data ? [res.data] : [];
//       setSearchResults(results);
//       if (results.length === 0) {
//         setMessage("No employees found");
//       }
//     } catch (err) {
//       setMessage("❌ Failed to search employee");
//     } finally {
//       setSearchLoading(false);
//     }
//   };

//   const loadSelectedEmployee = async () => {
//     if (!selectedEmployee) {
//       setMessage("❌ Please select an employee first");
//       return;
//     }
//     const fetchedUserId = selectedEmployee.ftechUserId?.userid;
//     setUserId(fetchedUserId || null);
    
//     setForm({
//       personalDetailsDTO: {
//         firstName: selectedEmployee.personalDetailsDTO.firstName || "",
//         middleName: selectedEmployee.personalDetailsDTO.middleName || "",
//         lastName: selectedEmployee.personalDetailsDTO.lastName || "",
//         gender: selectedEmployee.personalDetailsDTO.gender || "",
//         dob: selectedEmployee.personalDetailsDTO.dob || "",
//         nationality: selectedEmployee.personalDetailsDTO.nationality || "",
//         maritalStatus: selectedEmployee.personalDetailsDTO.maritalStatus || "",
//         bloodGroup: selectedEmployee.personalDetailsDTO.bloodGroup || "",
//         aadhaarNumber: selectedEmployee.personalDetailsDTO.aadhaarNumber || "",
//         panNumber: selectedEmployee.personalDetailsDTO.panNumber || "",
//         phoneNumber: selectedEmployee.personalDetailsDTO.phoneNumber || "",
//         emailId: selectedEmployee.personalDetailsDTO.emailId || "",
//         address1: selectedEmployee.personalDetailsDTO.address1 || "",
//         address2: selectedEmployee.personalDetailsDTO.address2 || "",
//         emergencyContactName: selectedEmployee.personalDetailsDTO.emergencyContactName || "",
//         emergencyContactRelation: selectedEmployee.personalDetailsDTO.emergencyContactRelation || "",
//         emergencyPhoneNumber: selectedEmployee.personalDetailsDTO.emergencyPhoneNumber || "",
//       },
//       jobDetailsDTO: {
//         departmentId: selectedEmployee.jobDetailsDTO.departmentId?.toString() || "",
//         designationId: selectedEmployee.jobDetailsDTO.designationId?.toString() || "",
//         workLocation: selectedEmployee.jobDetailsDTO.workLocation || "",
//         dateOfJoining: selectedEmployee.jobDetailsDTO.dateOfJoining || "",
//       },
//       bankDetailsDTO: {
//         bankName: selectedEmployee.bankDetailsDTO.bankName || "",
//         accountNumber: selectedEmployee.bankDetailsDTO.accountNumber?.toString() || "",
//         ifsc: selectedEmployee.bankDetailsDTO.ifsc || "",
//         branchName: selectedEmployee.bankDetailsDTO.branchName || "",
//         beneficiaryName: selectedEmployee.bankDetailsDTO.beneficiaryName || "",
//       },
//       employeeStatutoryDetailsDTO: {
//         pfUan: selectedEmployee.employeeStatutoryDetailsDTO.pfUan || "",
//         esi: selectedEmployee.employeeStatutoryDetailsDTO.esi || "",
//         min: selectedEmployee.employeeStatutoryDetailsDTO.min || "",
//       },
//       salaryDetailsDTO: {
//         ctc: selectedEmployee.salaryDetailsDTO.ctc?.toString() || "",
//         basic: selectedEmployee.salaryDetailsDTO.basic?.toString() || "",
//         hra: selectedEmployee.salaryDetailsDTO.hra?.toString() || "",
//         conveyanceAllowance: selectedEmployee.salaryDetailsDTO.conveyanceAllowance?.toString() || "",
//         pf: selectedEmployee.salaryDetailsDTO.pf?.toString() || "",
//       },
//       empMgrDto: {
//         mgrId: selectedEmployee.empMgrDto?.mgrId?.toString() || "",
//       }
//     });

//     if (fetchedUserId) {
//       try {
//         const res = await axios.get(`/api/hr/search-doc/${fetchedUserId}`, { withCredentials: true });
//         setExistingDocuments(res.data);
//       } catch (err) {
//         console.error("Documents fetch error", err);
//       }
//     }

//     setMode(fetchedUserId ? "edit" : "create");
//     setShowSearchResults(false);
//     setSelectedEmployee(null);
//     setSearchValue("");
//     setMessage("✅ Employee loaded for editing");
//     setCurrentStep(2); // Move to next step after loading
//   };

//   const handleFileChange = async (docKey, file) => {
//     if (!file) return;
//     if (mode === "edit" && userId) {
//       await uploadDocumentImmediately(docKey, file);
//     } else {
//       setUploadedFiles(prev => ({ ...prev, [docKey]: file }));
//       setMessage(`📁 ${getDocumentDisplayName(docKey)} selected`);
//     }
//   };

//   const uploadDocumentImmediately = async (docKey, file) => {
//     if (!userId) return;
//     const docConfig = documents.find(d => d.key === docKey);
//     if (!docConfig) return;

//     setUploadingDocuments(prev => ({ ...prev, [docKey]: true }));
//     try {
//       const existingDoc = existingDocuments.find(d => d.documentName === docConfig.documentName);
//       const formData = new FormData();
//       formData.append("file", file);

//       if (existingDoc && existingDoc.docId) {
//         await axios.put(
//           `/api/v1/users/${userId}/documents/${existingDoc.docId}/replace`,
//           formData,
//           { withCredentials: true, headers: { "Content-Type": "multipart/form-data" } }
//         );
//         setMessage(`✅ ${docConfig.displayName} replaced`);
//       } else {
//         const uploadFormData = new FormData();
//         uploadFormData.append("file", file);
//         uploadFormData.append("documentType", docConfig.apiKey);
//         uploadFormData.append("userId", userId);
//         await axios.post(
//           `/api/dept/hr/employee/document/upload`,
//           uploadFormData,
//           { withCredentials: true, headers: { "Content-Type": "multipart/form-data" } }
//         );
//         setMessage(`✅ ${docConfig.displayName} uploaded`);
//       }

//       const docsRes = await axios.get(`/api/hr/search-doc/${userId}`, { withCredentials: true });
//       setExistingDocuments(docsRes.data);
//     } catch (error) {
//       setMessage(`❌ Failed to upload ${docConfig.displayName}`);
//     } finally {
//       setUploadingDocuments(prev => ({ ...prev, [docKey]: false }));
//     }
//   };

//   const getDocumentDisplayName = (key) => {
//     const doc = documents.find(d => d.key === key);
//     return doc ? doc.displayName : key;
//   };

//   const getFileNameFromPath = (path) => {
//     if (!path) return "N/A";
//     const parts = path.split("/");
//     return parts[parts.length - 1] || "N/A";
//   };

//   const submitEmployee = async () => {
//     if (!validateCurrentStep()) return;
    
//     try {
//       setLoading(true);
//       setMessage("Processing employee...");

//       if (mode === "create") {
//         const formData = new FormData();
//         const payload = {
//           personalDetailsDTO: {
//             ...form.personalDetailsDTO,
//             gender: form.personalDetailsDTO.gender.toUpperCase(),
//             maritalStatus: form.personalDetailsDTO.maritalStatus.toUpperCase(),
//             panNumber: form.personalDetailsDTO.panNumber.toUpperCase(),
//           },
//           jobDetailsDTO: {
//             ...form.jobDetailsDTO,
//             departmentId: Number(form.jobDetailsDTO.departmentId),
//             designationId: Number(form.jobDetailsDTO.designationId),
//           },
//           salaryDetailsDTO: {
//             ctc: Number(form.salaryDetailsDTO.ctc),
//             basic: Number(form.salaryDetailsDTO.basic),
//             hra: Number(form.salaryDetailsDTO.hra),
//             conveyanceAllowance: Number(form.salaryDetailsDTO.conveyanceAllowance),
//             pf: Number(form.salaryDetailsDTO.pf),
//           },
//           bankDetailsDTO: form.bankDetailsDTO,
//           employeeStatutoryDetailsDTO: form.employeeStatutoryDetailsDTO,
//           empMgrDto: { mgrId: form.empMgrDto.mgrId ? Number(form.empMgrDto.mgrId) : null },
//         };

//         formData.append("dto", new Blob([JSON.stringify(payload)], { type: "application/json" }));
//         for (const docKey of Object.keys(uploadedFiles)) {
//           formData.append(docKey, uploadedFiles[docKey]);
//         }

//         await axios.post(`/api/dept/hr/onboarding`, formData, {
//           withCredentials: true,
//           headers: { 'Content-Type': 'multipart/form-data' }
//         });
//         setMessage("✅ Employee created successfully!");
//       } else {
//         const payload = {
//           personalDetailsDTO: {
//             ...form.personalDetailsDTO,
//             gender: form.personalDetailsDTO.gender.toUpperCase(),
//             maritalStatus: form.personalDetailsDTO.maritalStatus.toUpperCase(),
//             panNumber: form.personalDetailsDTO.panNumber.toUpperCase(),
//           },
//           jobDetailsDTO: {
//             ...form.jobDetailsDTO,
//             departmentId: Number(form.jobDetailsDTO.departmentId),
//             designationId: Number(form.jobDetailsDTO.designationId),
//           },
//           salaryDetailsDTO: {
//             ctc: Number(form.salaryDetailsDTO.ctc),
//             basic: Number(form.salaryDetailsDTO.basic),
//             hra: Number(form.salaryDetailsDTO.hra),
//             conveyanceAllowance: Number(form.salaryDetailsDTO.conveyanceAllowance),
//             pf: Number(form.salaryDetailsDTO.pf),
//           },
//           bankDetailsDTO: form.bankDetailsDTO,
//           employeeStatutoryDetailsDTO: form.employeeStatutoryDetailsDTO,
//           empMgrDto: { mgrId: form.empMgrDto.mgrId ? Number(form.empMgrDto.mgrId) : null },
//         };

//         await axios.put(`/api/dept/hr/employee/edit?userId=${userId}`, payload, {
//           withCredentials: true,
//           headers: { 'Content-Type': 'application/json' }
//         });
//         setMessage("✅ Employee updated successfully!");
//       }
//     } catch (err) {
//       setMessage(`❌ ${err.message}`);
//     } finally {
//       setLoading(false);
//     }
//   };

//   const resetForm = () => {
//     setForm({
//       personalDetailsDTO: {
//         firstName: "", middleName: "", lastName: "", gender: "", dob: "",
//         nationality: "", maritalStatus: "", bloodGroup: "", aadhaarNumber: "",
//         panNumber: "", phoneNumber: "", emailId: "", address1: "", address2: "",
//         emergencyContactName: "", emergencyContactRelation: "", emergencyPhoneNumber: "",
//       },
//       jobDetailsDTO: { departmentId: "", designationId: "", workLocation: "", dateOfJoining: "" },
//       bankDetailsDTO: { bankName: "", accountNumber: "", ifsc: "", branchName: "", beneficiaryName: "" },
//       employeeStatutoryDetailsDTO: { pfUan: "", esi: "", min: "" },
//       salaryDetailsDTO: { ctc: "", basic: "", hra: "", conveyanceAllowance: "", pf: "" },
//       empMgrDto: { mgrId: "" }
//     });
//     setCurrentStep(1);
//     setMode("create");
//     setUserId(null);
//     setMessage("");
//   };

//   // Manager search
//   const handleManagerSearch = async () => {
//     if (!managerSearchValue.trim()) return;
//     try {
//       setManagerSearchLoading(true);
//       const res = await axios.get(`/api/dept/hr/emp/search?value=${managerSearchValue}`, { withCredentials: true });
//       const results = Array.isArray(res.data) ? res.data : res.data ? [res.data] : [];
//       setManagerSearchResults(results);
//       setShowManagerSearch(true);
//     } catch (err) {
//       setMessage("❌ Failed to search manager");
//     } finally {
//       setManagerSearchLoading(false);
//     }
//   };

//   const selectManager = (employeeData) => {
//     const managerId = employeeData.ftechUserId?.userid;
//     if (managerId) {
//       setSelectedManager(employeeData);
//       setForm(prev => ({ ...prev, empMgrDto: { mgrId: managerId.toString() } }));
//       setMessage(`✅ Manager selected`);
//       setShowManagerSearch(false);
//     }
//   };

//   // Render step content
//   const renderStepContent = () => {
//     switch (currentStep) {
//       case 1:
//         return (
//           <div className="step-content">
//             <div className="step-header">
//               <h3>🔍 Search Employee</h3>
//               <p>Search for an existing employee to edit, or skip to create a new one</p>
//             </div>

//             <div className="search-container">
//               <div className="search-input-wrapper">
//                 <input
//                   type="text"
//                   value={searchValue}
//                   onChange={(e) => setSearchValue(e.target.value)}
//                   onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
//                   placeholder="Search by Employee Code, Name, Email, or Phone"
//                   className="modern-input"
//                 />
//                 <button onClick={handleSearch} className="search-btn" disabled={searchLoading}>
//                   {searchLoading ? "Searching..." : "Search"}
//                 </button>
//               </div>

//               {showSearchResults && searchResults.length > 0 && (
//                 <div className="search-results-card">
//                   <div className="results-header">
//                     <h4>Found {searchResults.length} employee(s)</h4>
//                     <button onClick={() => setShowSearchResults(false)}>×</button>
//                   </div>
//                   <div className="results-list">
//                     {searchResults.map((emp, idx) => (
//                       <div
//                         key={idx}
//                         className={`result-item ${selectedEmployee === emp ? 'selected' : ''}`}
//                         onClick={() => setSelectedEmployee(emp)}
//                       >
//                         <div className="result-info">
//                           <h5>{emp.personalDetailsDTO?.firstName} {emp.personalDetailsDTO?.lastName}</h5>
//                           <p>ID: {emp.ftechUserId?.userid} | {emp.personalDetailsDTO?.emailId}</p>
//                         </div>
//                         {selectedEmployee === emp && <span className="check-mark">✓</span>}
//                       </div>
//                     ))}
//                   </div>
//                   {selectedEmployee && (
//                     <button onClick={loadSelectedEmployee} className="load-btn">
//                       Load for Editing
//                     </button>
//                   )}
//                 </div>
//               )}

//               <div className="or-divider">
//                 <span>OR</span>
//               </div>

//               <button onClick={() => setCurrentStep(2)} className="create-new-btn">
//                 Create New Employee
//               </button>
//             </div>
//           </div>
//         );

//       case 2:
//         return (
//           <div className="step-content">
//             <div className="step-header">
//               <h3>👤 Personal Details</h3>
//               <p>Enter basic personal information</p>
//             </div>
//             <div className="form-grid-2">
//               <div className="input-group">
//                 <label>First Name <span className="required">*</span></label>
//                 <input
//                   value={form.personalDetailsDTO.firstName}
//                   onChange={(e) => handleChange("personalDetailsDTO", "firstName", e.target.value)}
//                   placeholder="Enter first name"
//                   className="modern-input"
//                 />
//               </div>
//               <div className="input-group">
//                 <label>Middle Name</label>
//                 <input
//                   value={form.personalDetailsDTO.middleName}
//                   onChange={(e) => handleChange("personalDetailsDTO", "middleName", e.target.value)}
//                   placeholder="Enter middle name"
//                   className="modern-input"
//                 />
//               </div>
//               <div className="input-group">
//                 <label>Last Name <span className="required">*</span></label>
//                 <input
//                   value={form.personalDetailsDTO.lastName}
//                   onChange={(e) => handleChange("personalDetailsDTO", "lastName", e.target.value)}
//                   placeholder="Enter last name"
//                   className="modern-input"
//                 />
//               </div>
//               <div className="input-group">
//                 <label>Gender <span className="required">*</span></label>
//                 <select
//                   value={form.personalDetailsDTO.gender}
//                   onChange={(e) => handleChange("personalDetailsDTO", "gender", e.target.value)}
//                   className="modern-input"
//                 >
//                   <option value="">Select Gender</option>
//                   <option value="Male">Male</option>
//                   <option value="Female">Female</option>
//                   <option value="Other">Other</option>
//                 </select>
//               </div>
//               <div className="input-group">
//                 <label>Date of Birth <span className="required">*</span></label>
//                 <input
//                   type="date"
//                   value={form.personalDetailsDTO.dob}
//                   onChange={(e) => handleChange("personalDetailsDTO", "dob", e.target.value)}
//                   className="modern-input"
//                 />
//               </div>
//               <div className="input-group">
//                 <label>Nationality</label>
//                 <select
//                   value={form.personalDetailsDTO.nationality}
//                   onChange={(e) => handleChange("personalDetailsDTO", "nationality", e.target.value)}
//                   className="modern-input"
//                 >
//                   <option value="">Select Nationality</option>
//                   <option value="Indian">Indian</option>
//                   <option value="American">American</option>
//                   <option value="British">British</option>
//                   <option value="Other">Other</option>
//                 </select>
//               </div>
//               <div className="input-group">
//                 <label>Marital Status</label>
//                 <select
//                   value={form.personalDetailsDTO.maritalStatus}
//                   onChange={(e) => handleChange("personalDetailsDTO", "maritalStatus", e.target.value)}
//                   className="modern-input"
//                 >
//                   <option value="">Select Status</option>
//                   <option value="Single">Single</option>
//                   <option value="Married">Married</option>
//                   <option value="Divorced">Divorced</option>
//                 </select>
//               </div>
//               <div className="input-group">
//                 <label>Blood Group</label>
//                 <select
//                   value={form.personalDetailsDTO.bloodGroup}
//                   onChange={(e) => handleChange("personalDetailsDTO", "bloodGroup", e.target.value)}
//                   className="modern-input"
//                 >
//                   <option value="">Select Blood Group</option>
//                   <option value="A+">A+</option>
//                   <option value="A-">A-</option>
//                   <option value="B+">B+</option>
//                   <option value="B-">B-</option>
//                   <option value="AB+">AB+</option>
//                   <option value="AB-">AB-</option>
//                   <option value="O+">O+</option>
//                   <option value="O-">O-</option>
//                 </select>
//               </div>
//               <div className="input-group">
//                 <label>Aadhaar Number</label>
//                 <input
//                   value={form.personalDetailsDTO.aadhaarNumber}
//                   onChange={(e) => handleChange("personalDetailsDTO", "aadhaarNumber", e.target.value)}
//                   placeholder="12-digit Aadhaar"
//                   className="modern-input"
//                 />
//               </div>
//               <div className="input-group">
//                 <label>PAN Number</label>
//                 <input
//                   value={form.personalDetailsDTO.panNumber}
//                   onChange={(e) => handleChange("personalDetailsDTO", "panNumber", e.target.value.toUpperCase())}
//                   placeholder="ABCDE1234F"
//                   className="modern-input"
//                 />
//               </div>
//             </div>
//           </div>
//         );

//       case 3:
//         return (
//           <div className="step-content">
//             <div className="step-header">
//               <h3>📞 Contact Information</h3>
//               <p>Phone, email, and address details</p>
//             </div>
//             <div className="form-grid-2">
//               <div className="input-group">
//                 <label>Phone Number <span className="required">*</span></label>
//                 <input
//                   value={form.personalDetailsDTO.phoneNumber}
//                   onChange={(e) => handleChange("personalDetailsDTO", "phoneNumber", e.target.value)}
//                   placeholder="10-digit phone"
//                   className="modern-input"
//                 />
//               </div>
//               <div className="input-group">
//                 <label>Email <span className="required">*</span></label>
//                 <input
//                   type="email"
//                   value={form.personalDetailsDTO.emailId}
//                   onChange={(e) => handleChange("personalDetailsDTO", "emailId", e.target.value)}
//                   placeholder="example@domain.com"
//                   className="modern-input"
//                 />
//               </div>
//               <div className="input-group full-width">
//                 <label>Current Address <span className="required">*</span></label>
//                 <textarea
//                   value={form.personalDetailsDTO.address1}
//                   onChange={(e) => handleChange("personalDetailsDTO", "address1", e.target.value)}
//                   rows="3"
//                   placeholder="Enter current address"
//                   className="modern-input"
//                 />
//               </div>
//               <div className="input-group full-width">
//                 <label>Permanent Address</label>
//                 <textarea
//                   value={form.personalDetailsDTO.address2}
//                   onChange={(e) => handleChange("personalDetailsDTO", "address2", e.target.value)}
//                   rows="3"
//                   placeholder="Enter permanent address"
//                   className="modern-input"
//                 />
//               </div>
//               <div className="input-group">
//                 <label>Emergency Contact Name</label>
//                 <input
//                   value={form.personalDetailsDTO.emergencyContactName}
//                   onChange={(e) => handleChange("personalDetailsDTO", "emergencyContactName", e.target.value)}
//                   placeholder="Contact name"
//                   className="modern-input"
//                 />
//               </div>
//               <div className="input-group">
//                 <label>Emergency Contact Relation</label>
//                 <select
//                   value={form.personalDetailsDTO.emergencyContactRelation}
//                   onChange={(e) => handleChange("personalDetailsDTO", "emergencyContactRelation", e.target.value)}
//                   className="modern-input"
//                 >
//                   <option value="">Select Relation</option>
//                   <option value="Father">Father</option>
//                   <option value="Mother">Mother</option>
//                   <option value="Spouse">Spouse</option>
//                   <option value="Sibling">Sibling</option>
//                   <option value="Friend">Friend</option>
//                 </select>
//               </div>
//               <div className="input-group">
//                 <label>Emergency Phone Number</label>
//                 <input
//                   value={form.personalDetailsDTO.emergencyPhoneNumber}
//                   onChange={(e) => handleChange("personalDetailsDTO", "emergencyPhoneNumber", e.target.value)}
//                   placeholder="Emergency contact"
//                   className="modern-input"
//                 />
//               </div>
//             </div>
//           </div>
//         );

//       case 4:
//         return (
//           <div className="step-content">
//             <div className="step-header">
//               <h3>💼 Job Details</h3>
//               <p>Department, designation, and work information</p>
//             </div>
//             <div className="form-grid-2">
//               <div className="input-group">
//                 <label>Department <span className="required">*</span></label>
//                 <select
//                   value={form.jobDetailsDTO.departmentId}
//                   onChange={(e) => handleChange("jobDetailsDTO", "departmentId", e.target.value)}
//                   className="modern-input"
//                 >
//                   <option value="">Select Department</option>
//                   {departments.map((dept) => (
//                     <option key={dept.id} value={dept.id}>{dept.departmentName}</option>
//                   ))}
//                 </select>
//               </div>
//               <div className="input-group">
//                 <label>Designation <span className="required">*</span></label>
//                 <select
//                   value={form.jobDetailsDTO.designationId}
//                   onChange={(e) => handleChange("jobDetailsDTO", "designationId", e.target.value)}
//                   className="modern-input"
//                 >
//                   <option value="">Select Designation</option>
//                   {designations.map((des) => (
//                     <option key={des.id} value={des.id}>{des.designationName}</option>
//                   ))}
//                 </select>
//               </div>
//               <div className="input-group">
//                 <label>Date of Joining <span className="required">*</span></label>
//                 <input
//                   type="date"
//                   value={form.jobDetailsDTO.dateOfJoining}
//                   onChange={(e) => handleChange("jobDetailsDTO", "dateOfJoining", e.target.value)}
//                   className="modern-input"
//                 />
//               </div>
//               <div className="input-group">
//                 <label>Work Location</label>
//                 <input
//                   value={form.jobDetailsDTO.workLocation}
//                   onChange={(e) => handleChange("jobDetailsDTO", "workLocation", e.target.value)}
//                   placeholder="Enter work location"
//                   className="modern-input"
//                 />
//               </div>
//             </div>
//           </div>
//         );

//       case 5:
//         return (
//           <div className="step-content">
//             <div className="step-header">
//               <h3>👔 Manager Assignment</h3>
//               <p>Search and assign a reporting manager</p>
//             </div>
//             <div className="manager-assignment">
//               {selectedManager ? (
//                 <div className="selected-manager-card">
//                   <div className="manager-info">
//                     <h4>{selectedManager.personalDetailsDTO?.firstName} {selectedManager.personalDetailsDTO?.lastName}</h4>
//                     <p>ID: {selectedManager.ftechUserId?.userid}</p>
//                     <p>{selectedManager.personalDetailsDTO?.emailId}</p>
//                   </div>
//                   <button onClick={() => { setSelectedManager(null); setForm(prev => ({ ...prev, empMgrDto: { mgrId: "" } })); }} className="remove-btn">
//                     Remove
//                   </button>
//                 </div>
//               ) : (
//                 <div className="manager-search">
//                   <div className="search-input-wrapper">
//                     <input
//                       value={managerSearchValue}
//                       onChange={(e) => setManagerSearchValue(e.target.value)}
//                       onKeyPress={(e) => e.key === 'Enter' && handleManagerSearch()}
//                       placeholder="Search manager by name or email"
//                       className="modern-input"
//                     />
//                     <button onClick={handleManagerSearch} className="search-btn" disabled={managerSearchLoading}>
//                       {managerSearchLoading ? "Searching..." : "Search"}
//                     </button>
//                   </div>
//                   {showManagerSearch && managerSearchResults.length > 0 && (
//                     <div className="manager-results">
//                       {managerSearchResults.map((emp, idx) => (
//                         <div key={idx} className="manager-result-item" onClick={() => selectManager(emp)}>
//                           <h5>{emp.personalDetailsDTO?.firstName} {emp.personalDetailsDTO?.lastName}</h5>
//                           <p>ID: {emp.ftechUserId?.userid} | {emp.personalDetailsDTO?.emailId}</p>
//                         </div>
//                       ))}
//                     </div>
//                   )}
//                 </div>
//               )}
//               <p className="skip-note">This step is optional. You can skip if no manager is assigned.</p>
//             </div>
//           </div>
//         );

//       case 6:
//         return (
//           <div className="step-content">
//             <div className="step-header">
//               <h3>🏦 Bank Details</h3>
//               <p>Enter bank account information for salary processing</p>
//             </div>
//             <div className="form-grid-2">
//               <div className="input-group">
//                 <label>Bank Name <span className="required">*</span></label>
//                 <input
//                   value={form.bankDetailsDTO.bankName}
//                   onChange={(e) => handleChange("bankDetailsDTO", "bankName", e.target.value)}
//                   placeholder="e.g., State Bank of India"
//                   className="modern-input"
//                 />
//               </div>
//               <div className="input-group">
//                 <label>Account Number <span className="required">*</span></label>
//                 <input
//                   value={form.bankDetailsDTO.accountNumber}
//                   onChange={(e) => handleChange("bankDetailsDTO", "accountNumber", e.target.value)}
//                   placeholder="Bank account number"
//                   className="modern-input"
//                 />
//               </div>
//               <div className="input-group">
//                 <label>IFSC Code <span className="required">*</span></label>
//                 <input
//                   value={form.bankDetailsDTO.ifsc}
//                   onChange={(e) => handleChange("bankDetailsDTO", "ifsc", e.target.value.toUpperCase())}
//                   placeholder="SBIN0001234"
//                   className="modern-input"
//                 />
//               </div>
//               <div className="input-group">
//                 <label>Branch Name</label>
//                 <input
//                   value={form.bankDetailsDTO.branchName}
//                   onChange={(e) => handleChange("bankDetailsDTO", "branchName", e.target.value)}
//                   placeholder="Branch location"
//                   className="modern-input"
//                 />
//               </div>
//               <div className="input-group full-width">
//                 <label>Beneficiary Name</label>
//                 <input
//                   value={form.bankDetailsDTO.beneficiaryName}
//                   onChange={(e) => handleChange("bankDetailsDTO", "beneficiaryName", e.target.value)}
//                   placeholder="Account holder name"
//                   className="modern-input"
//                 />
//               </div>
//             </div>
//           </div>
//         );

//       case 7:
//         return (
//           <div className="step-content">
//             <div className="step-header">
//               <h3>💰 Salary & Statutory Details</h3>
//               <p>CTC and statutory information</p>
//             </div>
            
//             <div className="salary-calculation-info">
//               <h4>Salary Breakdown</h4>
//               <p>Basic: {percentages?.basic}% | HRA: {percentages?.hra}% | PF: {percentages?.pf}%</p>
//             </div>

//             <div className="form-grid-2">
//               <div className="input-group full-width">
//                 <label>CTC (Annual) <span className="required">*</span></label>
//                 <input
//                   type="number"
//                   value={form.salaryDetailsDTO.ctc}
//                   onChange={(e) => handleChange("salaryDetailsDTO", "ctc", e.target.value)}
//                   placeholder="Enter annual CTC"
//                   className="modern-input"
//                 />
//                 <small className="helper-text">Salary components will auto-calculate</small>
//               </div>
//               <div className="input-group">
//                 <label>Basic Salary</label>
//                 <input
//                   type="number"
//                   value={form.salaryDetailsDTO.basic}
//                   readOnly
//                   className="modern-input readonly"
//                 />
//               </div>
//               <div className="input-group">
//                 <label>HRA</label>
//                 <input
//                   type="number"
//                   value={form.salaryDetailsDTO.hra}
//                   readOnly
//                   className="modern-input readonly"
//                 />
//               </div>
//               <div className="input-group">
//                 <label>PF</label>
//                 <input
//                   type="number"
//                   value={form.salaryDetailsDTO.pf}
//                   readOnly
//                   className="modern-input readonly"
//                 />
//               </div>
//               <div className="input-group">
//                 <label>Conveyance Allowance</label>
//                 <input
//                   type="number"
//                   value={form.salaryDetailsDTO.conveyanceAllowance}
//                   readOnly
//                   className="modern-input readonly"
//                 />
//               </div>
//               <div className="input-group net-salary-display">
//                 <label>Net Salary (Annual)</label>
//                 <input
//                   type="number"
//                   value={netSalary}
//                   readOnly
//                   className="modern-input readonly highlight"
//                 />
//               </div>
//             </div>

//             <div className="statutory-section">
//               <h4>Statutory Details</h4>
//               <div className="form-grid-2">
//                 <div className="input-group">
//                   <label>PF UAN</label>
//                   <input
//                     value={form.employeeStatutoryDetailsDTO.pfUan}
//                     onChange={(e) => handleChange("employeeStatutoryDetailsDTO", "pfUan", e.target.value)}
//                     placeholder="12-digit UAN"
//                     className="modern-input"
//                   />
//                 </div>
//                 <div className="input-group">
//                   <label>ESI Number</label>
//                   <input
//                     value={form.employeeStatutoryDetailsDTO.esi}
//                     onChange={(e) => handleChange("employeeStatutoryDetailsDTO", "esi", e.target.value)}
//                     placeholder="ESI number"
//                     className="modern-input"
//                   />
//                 </div>
//                 <div className="input-group full-width">
//                   <label>Medical Insurance Number</label>
//                   <input
//                     value={form.employeeStatutoryDetailsDTO.min}
//                     onChange={(e) => handleChange("employeeStatutoryDetailsDTO", "min", e.target.value)}
//                     placeholder="Medical insurance number"
//                     className="modern-input"
//                   />
//                 </div>
//               </div>
//             </div>
//           </div>
//         );

//       case 8:
//         return (
//           <div className="step-content">
//             <div className="step-header">
//               <h3>📄 Document Uploads</h3>
//               <p>Upload required documents</p>
//             </div>

//             {mode === "edit" && existingDocuments.length > 0 && (
//               <div className="existing-docs">
//                 <h4>Existing Documents</h4>
//                 {existingDocuments.map((doc) => (
//                   <div key={doc.docId} className="doc-item">
//                     <span>{doc.documentName}</span>
//                     <span className="doc-file">{getFileNameFromPath(doc.docPath)}</span>
//                   </div>
//                 ))}
//               </div>
//             )}

//             <div className="document-upload-grid">
//               {documents.map((doc) => {
//                 const isUploading = uploadingDocuments[doc.key];
//                 const existing = existingDocuments.find((d) => d.documentName === doc.documentName);
                
//                 return (
//                   <div key={doc.id} className="doc-upload-card">
//                     <div className="doc-header">
//                       <h5>{doc.displayName}</h5>
//                       {doc.mandatory && <span className="badge-required">Required</span>}
//                       {!doc.mandatory && <span className="badge-optional">Optional</span>}
//                     </div>
//                     <input
//                       type="file"
//                       onChange={(e) => handleFileChange(doc.key, e.target.files[0])}
//                       disabled={loading || isUploading}
//                       accept={doc.fileType === "PDF" ? ".pdf" : ".jpg,.jpeg,.png"}
//                       className="file-input"
//                     />
//                     {isUploading && <p className="uploading">Uploading...</p>}
//                     {existing && <p className="uploaded">✓ {getFileNameFromPath(existing.docPath)}</p>}
//                     {uploadedFiles[doc.key] && <p className="selected">Selected: {uploadedFiles[doc.key].name}</p>}
//                   </div>
//                 );
//               })}
//             </div>
//           </div>
//         );

//       default:
//         return null;
//     }
//   };

//   return (
//     <div className="modular-container">
//       <div className="modular-card">
//         {/* Header */}
//         {/* <div className="modular-header">
//           <h2>{mode === "create" ? "Create Employee" : "Edit Employee"}</h2>
//           <button onClick={resetForm} className="reset-btn">Reset</button>
//         </div> */}

//         {/* Progress Bar */}
//         <div className="progress-bar-container">
//           <div className="progress-bar">
//             <div 
//               className="progress-fill" 
//               style={{ width: `${(currentStep / totalSteps) * 100}%` }}
//             />
//           </div>
//           <div className="step-indicators">
//             {steps.map((step) => (
//               <div
//                 key={step.number}
//                 className={`step-indicator ${currentStep === step.number ? 'active' : ''} ${currentStep > step.number ? 'completed' : ''}`}
//                 onClick={() => goToStep(step.number)}
//               >
//                 <div className="step-number">
//                   {currentStep > step.number ? '✓' : step.icon}
//                 </div>
//                 <span className="step-title">{step.title}</span>
//               </div>
//             ))}
//           </div>
//         </div>

//         {/* Step Content */}
//         <div className="step-container">
//           {renderStepContent()}
//         </div>

//         {/* Navigation Buttons */}
//         <div className="navigation-buttons">
//           {currentStep > 1 && (
//             <button onClick={prevStep} className="nav-btn prev-btn">
//               ← Previous
//             </button>
//           )}
          
//           {currentStep < totalSteps && (
//             <button onClick={nextStep} className="nav-btn next-btn">
//               Next →
//             </button>
//           )}

//           {currentStep === totalSteps && (
//             <button onClick={submitEmployee} className="submit-btn" disabled={loading}>
//               {loading ? "Processing..." : mode === "create" ? "Create Employee" : "Update Employee"}
//             </button>
//           )}
//         </div>

//         {/* Message */}
//         {message && (
//           <div className={`message-toast ${message.includes('✅') ? 'success' : message.includes('❌') ? 'error' : 'info'}`}>
//             {message}
//           </div>
//         )}
//       </div>
//     </div>
//   );
// }

// export default HrEmployeeManagement;


import React, { useEffect, useState } from "react";
import axios from "axios";
import "./HrEmployeeManagement.css";
function HrEmployeeManagement() {
  const loggedInUserId = sessionStorage.getItem("userId");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [mode, setMode] = useState("create");
  const [userId, setUserId] = useState(null);
  const [errors, setErrors] = useState({});

  // Current step tracker
  const [currentStep, setCurrentStep] = useState(1);
  const totalSteps = 8;

  // Search states
  const [searchValue, setSearchValue] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [showSearchResults, setShowSearchResults] = useState(false);
  const [searchLoading, setSearchLoading] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState(null);

  // Manager search states
  const [managerSearchValue, setManagerSearchValue] = useState("");
  const [managerSearchResults, setManagerSearchResults] = useState([]);
  const [showManagerSearch, setShowManagerSearch] = useState(false);
  const [managerSearchLoading, setManagerSearchLoading] = useState(false);
  const [selectedManager, setSelectedManager] = useState(null);

  // API data
  const [departments, setDepartments] = useState([]);
  const [designations, setDesignations] = useState([]);
  const [percentages, setPercentages] = useState(null);
  const [documents, setDocuments] = useState([]);

  // Form state
  const [form, setForm] = useState({
    personalDetailsDTO: {
      firstName: "", middleName: "", lastName: "", gender: "", dob: "",
      nationality: "", maritalStatus: "", bloodGroup: "", aadhaarNumber: "",
      panNumber: "", phoneNumber: "", emailId: "", address1: "", address2: "",
      emergencyContactName: "", emergencyContactRelation: "", emergencyPhoneNumber: "",
    },
    jobDetailsDTO: {
      departmentId: "", designationId: "", workLocation: "", dateOfJoining: "",
    },
    bankDetailsDTO: {
      bankName: "", accountNumber: "", ifsc: "", branchName: "", beneficiaryName: "",
    },
    employeeStatutoryDetailsDTO: {
      pfUan: "", esi: "", min: "",
    },
    salaryDetailsDTO: {
      ctc: "", basic: "", hra: "", conveyanceAllowance: "", pf: "",
    },
    empMgrDto: {
      mgrId: "",
    }
  });

  const [netSalary, setNetSalary] = useState(0);
  const [uploadedFiles, setUploadedFiles] = useState({});
  const [existingDocuments, setExistingDocuments] = useState([]);
  const [uploadingDocuments, setUploadingDocuments] = useState({});

  // Step definitions
  const steps = [
    { number: 1, title: "Search Employee", icon: "🔍" },
    { number: 2, title: "Personal Details", icon: "👤" },
    { number: 3, title: "Contact Information", icon: "📞" },
    { number: 4, title: "Job Details", icon: "💼" },
    { number: 5, title: "Manager Assignment", icon: "👔" },
    { number: 6, title: "Bank Details", icon: "🏦" },
    { number: 7, title: "Salary & Statutory", icon: "💰" },
    { number: 8, title: "Document Uploads", icon: "📄" }
  ];

  // Fetch initial data
  useEffect(() => {
    axios.get(`/api/departments`, { withCredentials: true })
      .then((res) => setDepartments(res.data))
      .catch((err) => console.error("Department API error", err));

    axios.get(`/api/designations`, { withCredentials: true })
      .then((res) => setDesignations(res.data))
      .catch((err) => console.error("Designation API error", err));

    axios.get(`/api/salary/calculator/get`, { withCredentials: true })
      .then((res) => {
        const validItem = Array.isArray(res.data)
          ? res.data.find(item => item.basicPercentage > 0)
          : res.data;
        if (validItem) {
          setPercentages({
            basic: Number(validItem.basicPercentage),
            hra: Number(validItem.hraPercentage),
            pf: Number(validItem.pfPercentage),
          });
        }
      })
      .catch((err) => console.error("Salary percentages API error", err));

    const documentTypes = [
      { id: 1, documentName: "joining-letter", key: "joiningLetter", displayName: "Joining Letter", mandatory: true, fileType: "PDF", apiKey: "joining-letter" },
      { id: 2, documentName: "resume", key: "resume", displayName: "Resume", mandatory: true, fileType: "PDF", apiKey: "resume" },
      { id: 3, documentName: "resignation-letter", key: "resignationLetter", displayName: "Resignation Letter", mandatory: false, fileType: "PDF", apiKey: "resignation-letter" },
      { id: 4, documentName: "offer-letter", key: "offerLetter", displayName: "Offer Letter", mandatory: true, fileType: "PDF", apiKey: "offer-letter" },
      { id: 5, documentName: "photograph", key: "photograph", displayName: "Photograph", mandatory: true, fileType: "JPG/PNG", apiKey: "photograph" },
    ];
    setDocuments(documentTypes);
  }, []);

  // Auto-calculate salary
  useEffect(() => {
    if (!percentages || !form.salaryDetailsDTO.ctc) return;
    const ctcAmount = Number(form.salaryDetailsDTO.ctc);
    if (isNaN(ctcAmount) || ctcAmount <= 0) return;

    const basic = (ctcAmount * percentages.basic) / 100;
    const hra = (basic * percentages.hra) / 100;
    const pf = (basic * percentages.pf) / 100;
    const conveyanceAllowance = ctcAmount - (basic + hra + pf);
    const net = ctcAmount - pf;

    setForm(prev => ({
      ...prev,
      salaryDetailsDTO: {
        ...prev.salaryDetailsDTO,
        basic: basic.toFixed(0),
        hra: hra.toFixed(0),
        pf: pf.toFixed(0),
        conveyanceAllowance: conveyanceAllowance.toFixed(0)
      }
    }));
    setNetSalary(net.toFixed(0));
  }, [form.salaryDetailsDTO.ctc, percentages]);

  const handleChange = (section, field, value) => {
    setForm((prev) => ({
      ...prev,
      [section]: { ...prev[section], [field]: value },
    }));
  };
  const validateField = (field, value) => {
    let err = "";



if (field === "ifsc") {
  const ifscRegex = /^[A-Z]{4}0[A-Z0-9]{6}$/;

  if (!value)
    err = "IFSC code is required";
  else if (value.length !== 11)
    err = "IFSC must be 11 characters";
  else if (!ifscRegex.test(value))
    err = "Invalid IFSC format (e.g., SBIN0001234)";
}

    // Only alphabets regex
    const nameRegex = /^[A-Za-z]+$/;

    if (field === "firstName") {
      if (!nameRegex.test(value))
        err = "First name should contain only alphabets";
      else if (value.length < 2)
        err = "First name must be at least 2 characters";
    }

    if (field === "lastName") {
      if (!nameRegex.test(value))
        err = "Last name should contain only alphabets";
      else if (value.length > 50)
        err = "Last name cannot exceed 50 characters";
    }

    if (field === "dob") {
      const dob = new Date(value);
      const today = new Date();
      const age = today.getFullYear() - dob.getFullYear();

      if (age < 20)
        err = "Employee age must be at least 20 years";
    }

    if (field === "aadhaar") {
      if (!/^[2-9][0-9]{11}$/.test(value))
        err = "Aadhaar must be 12 digits and cannot start with 0 or 1";
      else if (existingAadhaars.includes(value))
        err = "Aadhaar already exists";
    }

    if (field === "pan") {
      const panRegex = /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/;

      if (!panRegex.test(value))
        err = "PAN must be in format ABCDE1234F";
    }

    if (field === "phone") {
      if (!/^[6-9][0-9]{9}$/.test(value))
        err = "Phone must start with 6,7,8,9 and be 10 digits";
      else if (existingPhones.includes(value))
        err = "Phone number already exists";
    }

    if (field === "email") {
      const emailRegex = /^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/;
      if (!emailRegex.test(value))
        err = "Enter valid email format";
      else if (existingEmails.includes(value))
        err = "Email already exists";
    }

    if (field === "address") {
      if (value.trim().length < 10)
        err = "Address must be at least 10 characters";
    }

    if (field === "emergencyName") {
      if (!/^[A-Za-z ]{2,50}$/.test(value))
        err = "Only alphabets allowed (min 2 characters)";
    }

    if (field === "emergencyPhone") {
      if (!/^[6-9][0-9]{9}$/.test(value))
        err = "Invalid emergency phone number";
    }

    setErrors(prev => ({ ...prev, [field]: err }));
  };

  // Navigation handlers
  const nextStep = () => {
    if (!validateCurrentStep()) return;

    // mark current step completed
    setCompletedSteps(prev => ({
      ...prev,
      [currentStep]: true
    }));

    setCurrentStep(prev => Math.min(prev + 1, totalSteps));
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const prevStep = () => {
    setCurrentStep(prev => Math.max(prev - 1, 1));
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };
  const goToStep = (step) => {

    // user can always go back
    if (step < currentStep) {
      setCurrentStep(step);
      return;
    }

    // check previous step completed
    for (let i = 1; i < step; i++) {
      if (!completedSteps[i]) {
        setMessage(`❌ Please complete "${steps[i-1].title}" first`);
        return;
      }
    }

    setMessage("");
    setCurrentStep(step);
  };
  const [completedSteps, setCompletedSteps] = useState({
    1: false,
    2: false,
    3: false,
    4: false,
    5: false,
    6: false,
    7: false,
    8: false
  });


  // ❌ Block if any field has validation error
const hasErrors = Object.values(errors).some(err => err);

if (hasErrors) {
  setMessage("❌ Please fix validation errors before proceeding");
  return false;
}


const validateCurrentStep = () => {

  // ❌ Stop if any field has validation error
  const hasErrors = Object.values(errors).some(err => err);

  if (hasErrors) {
    setMessage("❌ Please fix validation errors before proceeding");
    return false;
  }

  switch (currentStep) {

    // 👤 STEP 2 — Personal Details
    case 2:
      if (!form.personalDetailsDTO.firstName) {
        setMessage("❌ Please enter first name");
        return false;
      }
      if (!form.personalDetailsDTO.lastName) {
        setMessage("❌ Please enter last name");
        return false;
      }
      if (!form.personalDetailsDTO.gender) {
        setMessage("❌ Please select gender");
        return false;
      }
      if (!form.personalDetailsDTO.dob) {
        setMessage("❌ Please select date of birth");
        return false;
      }
      if (!form.personalDetailsDTO.nationality) {
        setMessage("❌ Please select nationality");
        return false;
      }
      if (!form.personalDetailsDTO.bloodGroup) {
        setMessage("❌ Please select blood group");
        return false;
      }
      if (!form.personalDetailsDTO.aadhaarNumber) {
        setMessage("❌ Please enter Aadhaar number");
        return false;
      }
      if (!form.personalDetailsDTO.panNumber) {
        setMessage("❌ Please enter PAN number");
        return false;
      }
      break;

    // 📞 STEP 3 — Contact Information
    case 3:
      if (!form.personalDetailsDTO.phoneNumber) {
        setMessage("❌ Please enter phone number");
        return false;
      }
      if (!form.personalDetailsDTO.emailId) {
        setMessage("❌ Please enter email");
        return false;
      }
      if (!form.personalDetailsDTO.address1) {
        setMessage("❌ Please enter current address");
        return false;
      }
      if (!form.personalDetailsDTO.emergencyContactName) {
        setMessage("❌ Please enter emergency contact name");
        return false;
      }
      if (!form.personalDetailsDTO.emergencyContactRelation) {
        setMessage("❌ Please select emergency relation");
        return false;
      }
      if (!form.personalDetailsDTO.emergencyPhoneNumber) {
        setMessage("❌ Please enter emergency phone number");
        return false;
      }
      break;

    // 💼 STEP 4 — Job Details
    case 4:
      if (!form.jobDetailsDTO.departmentId) {
        setMessage("❌ Please select department");
        return false;
      }
      if (!form.jobDetailsDTO.designationId) {
        setMessage("❌ Please select designation");
        return false;
      }
      if (!form.jobDetailsDTO.dateOfJoining) {
        setMessage("❌ Please select date of joining");
        return false;
      }
      break;

    // 👔 STEP 5 — Manager Assignment
    case 5:
      if (!form.empMgrDto.mgrId) {
        setMessage("❌ Please assign a reporting manager");
        return false;
      }
      break;

    // 🏦 STEP 6 — Bank Details
    case 6:
      if (!form.bankDetailsDTO.bankName) {
        setMessage("❌ Please enter bank name");
        return false;
      }
      if (!form.bankDetailsDTO.accountNumber) {
        setMessage("❌ Please enter account number");
        return false;
      }
      if (!form.bankDetailsDTO.ifsc) {
        setMessage("❌ Please enter IFSC code");
        return false;
      }
      if (!form.bankDetailsDTO.branchName) {
        setMessage("❌ Please enter branch name");
        return false;
      }
      if (!form.bankDetailsDTO.beneficiaryName) {
        setMessage("❌ Please enter beneficiary name");
        return false;
      }
      break;

    // 💰 STEP 7 — Salary & Statutory
    case 7:
      if (!form.salaryDetailsDTO.ctc || Number(form.salaryDetailsDTO.ctc) <= 0) {
        setMessage("❌ Please enter valid CTC amount");
        return false;
      }
      if (!form.employeeStatutoryDetailsDTO.pfUan) {
        setMessage("❌ Please enter PF UAN");
        return false;
      }
      if (!form.employeeStatutoryDetailsDTO.esi) {
        setMessage("❌ Please enter ESI number");
        return false;
      }
      if (!form.employeeStatutoryDetailsDTO.min) {
        setMessage("❌ Please enter medical insurance number");
        return false;
      }
      break;

    default:
      break;
  }

  setMessage("");
  return true;
};



  // // Validation for current step
  // const validateCurrentStep = () => {
  //   switch (currentStep) {
  //     case 2: // Personal Details
  //       if (!form.personalDetailsDTO.firstName) {
  //         setMessage("❌ Please enter first name");
  //         return false;
  //       }
  //       if (!form.personalDetailsDTO.lastName) {
  //         setMessage("❌ Please enter last name");
  //         return false;
  //       }
  //       if (!form.personalDetailsDTO.gender) {
  //         setMessage("❌ Please select gender");
  //         return false;
  //       }
  //       if (!form.personalDetailsDTO.dob) {
  //         setMessage("❌ Please select date of birth");
  //         return false;
  //       }
  //       break;
  //     case 3: // Contact Information
  //       if (!form.personalDetailsDTO.phoneNumber) {
  //         setMessage("❌ Please enter phone number");
  //         return false;
  //       }
  //       if (!form.personalDetailsDTO.emailId) {
  //         setMessage("❌ Please enter email");
  //         return false;
  //       }
  //       if (!form.personalDetailsDTO.address1) {
  //         setMessage("❌ Please enter current address");
  //         return false;
  //       }
  //       break;
  //     case 4: // Job Details
  //       if (!form.jobDetailsDTO.departmentId) {
  //         setMessage("❌ Please select department");
  //         return false;
  //       }
  //       if (!form.jobDetailsDTO.designationId) {
  //         setMessage("❌ Please select designation");
  //         return false;
  //       }
  //       if (!form.jobDetailsDTO.dateOfJoining) {
  //         setMessage("❌ Please select date of joining");
  //         return false;
  //       }
  //       break;
  //     case 6: // Bank Details
  //       if (!form.bankDetailsDTO.bankName) {
  //         setMessage("❌ Please enter bank name");
  //         return false;
  //       }
  //       if (!form.bankDetailsDTO.accountNumber) {
  //         setMessage("❌ Please enter account number");
  //         return false;
  //       }
  //       if (!form.bankDetailsDTO.ifsc) {
  //         setMessage("❌ Please enter IFSC code");
  //         return false;
  //       }
  //       break;
  //     case 7: // Salary
  //       if (!form.salaryDetailsDTO.ctc || Number(form.salaryDetailsDTO.ctc) <= 0) {
  //         setMessage("❌ Please enter valid CTC amount");
  //         return false;
  //       }
  //       break;
  //   }
  //   setMessage("");
  //   return true;
  // };


  useEffect(() => {
  if (!message) return;

  const timer = setTimeout(() => {
    setMessage("");
  }, 3000); // disappears after 3 seconds

  return () => clearTimeout(timer);
}, [message]);
  // Search employee
  const handleSearch = async () => {
    if (!searchValue.trim()) {
      setMessage("Please enter a search term");
      return;
    }
    try {
      setSearchLoading(true);
      setShowSearchResults(true);
      const res = await axios.get(`/api/dept/hr/emp/search?value=${searchValue}`, { withCredentials: true });
      const results = Array.isArray(res.data) ? res.data : res.data ? [res.data] : [];
      setSearchResults(results);
      if (results.length === 0) {
        setMessage("No employees found");
      }
    } catch (err) {
      setMessage("❌ Failed to search employee");
    } finally {
      setSearchLoading(false);
    }
  };

  const loadSelectedEmployee = async () => {
    if (!selectedEmployee) {
      setMessage("❌ Please select an employee first");
      return;
    }
    const fetchedUserId = selectedEmployee.ftechUserId?.userid;
    setUserId(fetchedUserId || null);

    setForm({
      personalDetailsDTO: {
        firstName: selectedEmployee.personalDetailsDTO.firstName || "",
        middleName: selectedEmployee.personalDetailsDTO.middleName || "",
        lastName: selectedEmployee.personalDetailsDTO.lastName || "",
        gender: selectedEmployee.personalDetailsDTO.gender || "",
        dob: selectedEmployee.personalDetailsDTO.dob || "",
        nationality: selectedEmployee.personalDetailsDTO.nationality || "",
        maritalStatus: selectedEmployee.personalDetailsDTO.maritalStatus || "",
        bloodGroup: selectedEmployee.personalDetailsDTO.bloodGroup || "",
        aadhaarNumber: selectedEmployee.personalDetailsDTO.aadhaarNumber || "",
        panNumber: selectedEmployee.personalDetailsDTO.panNumber || "",
        phoneNumber: selectedEmployee.personalDetailsDTO.phoneNumber || "",
        emailId: selectedEmployee.personalDetailsDTO.emailId || "",
        address1: selectedEmployee.personalDetailsDTO.address1 || "",
        address2: selectedEmployee.personalDetailsDTO.address2 || "",
        emergencyContactName: selectedEmployee.personalDetailsDTO.emergencyContactName || "",
        emergencyContactRelation: selectedEmployee.personalDetailsDTO.emergencyContactRelation || "",
        emergencyPhoneNumber: selectedEmployee.personalDetailsDTO.emergencyPhoneNumber || "",
      },
      jobDetailsDTO: {
        departmentId: selectedEmployee.jobDetailsDTO.departmentId?.toString() || "",
        designationId: selectedEmployee.jobDetailsDTO.designationId?.toString() || "",
        workLocation: selectedEmployee.jobDetailsDTO.workLocation || "",
        dateOfJoining: selectedEmployee.jobDetailsDTO.dateOfJoining || "",
      },
      bankDetailsDTO: {
        bankName: selectedEmployee.bankDetailsDTO.bankName || "",
        accountNumber: selectedEmployee.bankDetailsDTO.accountNumber?.toString() || "",
        ifsc: selectedEmployee.bankDetailsDTO.ifsc || "",
        branchName: selectedEmployee.bankDetailsDTO.branchName || "",
        beneficiaryName: selectedEmployee.bankDetailsDTO.beneficiaryName || "",
      },
      employeeStatutoryDetailsDTO: {
        pfUan: selectedEmployee.employeeStatutoryDetailsDTO.pfUan || "",
        esi: selectedEmployee.employeeStatutoryDetailsDTO.esi || "",
        min: selectedEmployee.employeeStatutoryDetailsDTO.min || "",
      },
      salaryDetailsDTO: {
        ctc: selectedEmployee.salaryDetailsDTO.ctc?.toString() || "",
        basic: selectedEmployee.salaryDetailsDTO.basic?.toString() || "",
        hra: selectedEmployee.salaryDetailsDTO.hra?.toString() || "",
        conveyanceAllowance: selectedEmployee.salaryDetailsDTO.conveyanceAllowance?.toString() || "",
        pf: selectedEmployee.salaryDetailsDTO.pf?.toString() || "",
      },
      empMgrDto: {
        mgrId: selectedEmployee.empMgrDto?.mgrId?.toString() || "",
      }
    });

    if (fetchedUserId) {
      try {
        const res = await axios.get(`/api/hr/search-doc/${fetchedUserId}`, { withCredentials: true });
        setExistingDocuments(res.data);
      } catch (err) {
        console.error("Documents fetch error", err);
      }
    }

    setMode(fetchedUserId ? "edit" : "create");
    setShowSearchResults(false);
    setSelectedEmployee(null);
    setSearchValue("");
    setMessage("✅ Employee loaded for editing");
    setCurrentStep(2); // Move to next step after loading
  };

  const handleFileChange = async (docKey, file) => {
    if (!file) return;
    if (mode === "edit" && userId) {
      await uploadDocumentImmediately(docKey, file);
    } else {
      setUploadedFiles(prev => ({ ...prev, [docKey]: file }));
      setMessage(`📁 ${getDocumentDisplayName(docKey)} selected`);
    }
  };

  const uploadDocumentImmediately = async (docKey, file) => {
    if (!userId) return;
    const docConfig = documents.find(d => d.key === docKey);
    if (!docConfig) return;

    setUploadingDocuments(prev => ({ ...prev, [docKey]: true }));
    try {
      const existingDoc = existingDocuments.find(d => d.documentName === docConfig.documentName);
      const formData = new FormData();
      formData.append("file", file);

      if (existingDoc && existingDoc.docId) {
        await axios.put(
          `/api/v1/users/${userId}/documents/${existingDoc.docId}/replace`,
          formData,
          { withCredentials: true, headers: { "Content-Type": "multipart/form-data" } }
        );
        setMessage(`✅ ${docConfig.displayName} replaced`);
      } else {
        const uploadFormData = new FormData();
        uploadFormData.append("file", file);
        uploadFormData.append("documentType", docConfig.apiKey);
        uploadFormData.append("userId", userId);
        await axios.post(
          `/api/dept/hr/employee/document/upload`,
          uploadFormData,
          { withCredentials: true, headers: { "Content-Type": "multipart/form-data" } }
        );
        setMessage(`✅ ${docConfig.displayName} uploaded`);
      }

      const docsRes = await axios.get(`/api/hr/search-doc/${userId}`, { withCredentials: true });
      setExistingDocuments(docsRes.data);
    } catch (error) {
      setMessage(`❌ Failed to upload ${docConfig.displayName}`);
    } finally {
      setUploadingDocuments(prev => ({ ...prev, [docKey]: false }));
    }
  };

  const getDocumentDisplayName = (key) => {
    const doc = documents.find(d => d.key === key);
    return doc ? doc.displayName : key;
  };

  const getFileNameFromPath = (path) => {
    if (!path) return "N/A";
    const parts = path.split("/");
    return parts[parts.length - 1] || "N/A";
  };

  const submitEmployee = async () => {
    if (!validateCurrentStep()) return;

    try {
      setLoading(true);
      setMessage("Processing employee...");

      if (mode === "create") {
        const formData = new FormData();
        const payload = {
          personalDetailsDTO: {
            ...form.personalDetailsDTO,
            gender: form.personalDetailsDTO.gender.toUpperCase(),
            maritalStatus: form.personalDetailsDTO.maritalStatus.toUpperCase(),
            panNumber: form.personalDetailsDTO.panNumber.toUpperCase(),
          },
          jobDetailsDTO: {
            ...form.jobDetailsDTO,
            departmentId: Number(form.jobDetailsDTO.departmentId),
            designationId: Number(form.jobDetailsDTO.designationId),
          },
          salaryDetailsDTO: {
            ctc: Number(form.salaryDetailsDTO.ctc),
            basic: Number(form.salaryDetailsDTO.basic),
            hra: Number(form.salaryDetailsDTO.hra),
            conveyanceAllowance: Number(form.salaryDetailsDTO.conveyanceAllowance),
            pf: Number(form.salaryDetailsDTO.pf),
          },
          bankDetailsDTO: form.bankDetailsDTO,
          employeeStatutoryDetailsDTO: form.employeeStatutoryDetailsDTO,
          empMgrDto: { mgrId: form.empMgrDto.mgrId ? Number(form.empMgrDto.mgrId) : null },
        };

        formData.append("dto", new Blob([JSON.stringify(payload)], { type: "application/json" }));
        for (const docKey of Object.keys(uploadedFiles)) {
          formData.append(docKey, uploadedFiles[docKey]);
        }

        await axios.post(`/api/dept/hr/onboarding`, formData, {
          withCredentials: true,
          headers: { 'Content-Type': 'multipart/form-data' }
        });
        setMessage("✅ Employee created successfully!");
      } else {
        const payload = {
          personalDetailsDTO: {
            ...form.personalDetailsDTO,
            gender: form.personalDetailsDTO.gender.toUpperCase(),
            maritalStatus: form.personalDetailsDTO.maritalStatus.toUpperCase(),
            panNumber: form.personalDetailsDTO.panNumber.toUpperCase(),
          },
          jobDetailsDTO: {
            ...form.jobDetailsDTO,
            departmentId: Number(form.jobDetailsDTO.departmentId),
            designationId: Number(form.jobDetailsDTO.designationId),
          },
          salaryDetailsDTO: {
            ctc: Number(form.salaryDetailsDTO.ctc),
            basic: Number(form.salaryDetailsDTO.basic),
            hra: Number(form.salaryDetailsDTO.hra),
            conveyanceAllowance: Number(form.salaryDetailsDTO.conveyanceAllowance),
            pf: Number(form.salaryDetailsDTO.pf),
          },
          bankDetailsDTO: form.bankDetailsDTO,
          employeeStatutoryDetailsDTO: form.employeeStatutoryDetailsDTO,
          empMgrDto: { mgrId: form.empMgrDto.mgrId ? Number(form.empMgrDto.mgrId) : null },
        };

        await axios.put(`/api/dept/hr/employee/edit?userId=${userId}`, payload, {
          withCredentials: true,
          headers: { 'Content-Type': 'application/json' }
        });
        setMessage("✅ Employee updated successfully!");
      }
    } catch (err) {
      setMessage(`❌ ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setForm({
      personalDetailsDTO: {
        firstName: "", middleName: "", lastName: "", gender: "", dob: "",
        nationality: "", maritalStatus: "", bloodGroup: "", aadhaarNumber: "",
        panNumber: "", phoneNumber: "", emailId: "", address1: "", address2: "",
        emergencyContactName: "", emergencyContactRelation: "", emergencyPhoneNumber: "",
      },
      jobDetailsDTO: { departmentId: "", designationId: "", workLocation: "", dateOfJoining: "" },
      bankDetailsDTO: { bankName: "", accountNumber: "", ifsc: "", branchName: "", beneficiaryName: "" },
      employeeStatutoryDetailsDTO: { pfUan: "", esi: "", min: "" },
      salaryDetailsDTO: { ctc: "", basic: "", hra: "", conveyanceAllowance: "", pf: "" },
      empMgrDto: { mgrId: "" }
    });
    setCurrentStep(1);
    setMode("create");
    setUserId(null);
    setMessage("");
  };

  // Manager search
  const handleManagerSearch = async () => {
    if (!managerSearchValue.trim()) return;
    try {
      setManagerSearchLoading(true);
      const res = await axios.get(`/api/dept/hr/emp/search?value=${managerSearchValue}`, { withCredentials: true });
      const results = Array.isArray(res.data) ? res.data : res.data ? [res.data] : [];
      setManagerSearchResults(results);
      setShowManagerSearch(true);
    } catch (err) {
      setMessage("❌ Failed to search manager");
    } finally {
      setManagerSearchLoading(false);
    }
  };

  const selectManager = (employeeData) => {
    const managerId = employeeData.ftechUserId?.userid;
    if (managerId) {
      setSelectedManager(employeeData);
      setForm(prev => ({ ...prev, empMgrDto: { mgrId: managerId.toString() } }));
      setMessage(`✅ Manager selected`);
      setShowManagerSearch(false);
    }
  };

  // Render step content
  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="step-content">
            <div className="step-header">
              <h3>🔍 Search Employee</h3>
              <p>Search for an existing employee to edit, or skip to create a new one</p>
            </div>

            <div className="search-container">
              <div className="search-input-wrapper">
                <input
                  type="text"
                  value={searchValue}
                  onChange={(e) => setSearchValue(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                  placeholder="Search by Employee Code, Name, Email, or Phone"
                  className="modern-input"
                />
                <button onClick={handleSearch} className="search-btn" disabled={searchLoading}>
                  {searchLoading ? "Searching..." : "Search"}
                </button>
              </div>

              {showSearchResults && searchResults.length > 0 && (
                <div className="search-results-card">
                  <div className="results-header">
                    <h4>Found {searchResults.length} employee(s)</h4>
                    <button onClick={() => setShowSearchResults(false)}>×</button>
                  </div>
                  <div className="results-list">
                    {searchResults.map((emp, idx) => (
                      <div
                        key={idx}
                        className={`result-item ${selectedEmployee === emp ? 'selected' : ''}`}
                        onClick={() => setSelectedEmployee(emp)}
                      >
                        <div className="result-info">
                          <h5>{emp.personalDetailsDTO?.firstName} {emp.personalDetailsDTO?.lastName}</h5>
                          <p>ID: {emp.ftechUserId?.userid} | {emp.personalDetailsDTO?.emailId}</p>
                        </div>
                        {selectedEmployee === emp && <span className="check-mark">✓</span>}
                      </div>
                    ))}
                  </div>
                  {selectedEmployee && (
                    <button onClick={loadSelectedEmployee} className="load-btn">
                      Load for Editing
                    </button>
                  )}
                </div>
              )}

              <div className="or-divider">
                <span>OR</span>
              </div>

              <button onClick={() => setCurrentStep(2)} className="create-new-btn">
                Create New Employee
              </button>
            </div>
          </div>
        );

      case 2:
        return (
          <div className="step-content">
            <div className="step-header">
              <h3>👤 Personal Details</h3>
              <p>Enter basic personal information</p>
            </div>
            <div className="form-grid-2">
              <div className="input-group">
                <label>First Name <span className="required">*</span></label>
                <input
                  value={form.personalDetailsDTO.firstName}
                  onChange={(e) => {
                    let val = e.target.value.replace(/[^A-Za-z]/g, ""); // remove numbers & symbols
                    handleChange("personalDetailsDTO", "firstName", val);
                    validateField("firstName", val);
                    if (val && message === "❌ Please enter first name") setMessage("");
                  }}
                  onKeyDown={(e) => {
                    if (!/[a-zA-Z]/.test(e.key) && e.key !== "Backspace" && e.key !== "Tab")
                      e.preventDefault();
                  }}
                  placeholder="Enter first name"
                  className="modern-input"
                />
                {errors.firstName && <small className="error">{errors.firstName}</small>}
              </div>
              <div className="input-group">
                <label>Middle Name</label>
                <input
                  value={form.personalDetailsDTO.middleName}
                  onChange={(e) => handleChange("personalDetailsDTO", "middleName", e.target.value)}
                  placeholder="Enter middle name"
                  className="modern-input"
                />
              </div>
              <div className="input-group">
                <label>Last Name <span className="required">*</span></label>
                <input
                  value={form.personalDetailsDTO.lastName}
                  onChange={(e) => {
                    let val = e.target.value.replace(/[^A-Za-z]/g, "").slice(0,50);
                    handleChange("personalDetailsDTO", "lastName", val);
                    validateField("lastName", val);
                    if (val && message === "❌ Please enter last name") setMessage("");
                  }}
                  onKeyDown={(e) => {
                    if (!/[a-zA-Z]/.test(e.key) && e.key !== "Backspace" && e.key !== "Tab")
                      e.preventDefault();
                  }}
                  placeholder="Enter last name"
                  className="modern-input"
                />
                {errors.lastName && <small className="error">{errors.lastName}</small>}
              </div>
              <div className="input-group">
                <label>Gender <span className="required">*</span></label>
                <select
                  value={form.personalDetailsDTO.gender}
                  onChange={(e) => {
                    handleChange("personalDetailsDTO", "gender", e.target.value);
                    if (e.target.value && message === "❌ Please select gender") setMessage("");
                  }}
                  className="modern-input"
                >
                  <option value="">Select Gender</option>
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                  <option value="Other">Other</option>
                </select>
              </div>
              <div className="input-group">
                <label>Date of Birth <span className="required">*</span></label>
                <input
                  type="date"
                  max={new Date(new Date().setFullYear(new Date().getFullYear() - 20))
                    .toISOString()
                    .split("T")[0]}
                  value={form.personalDetailsDTO.dob}
                  onChange={(e) => {
                    const val = e.target.value;
                    handleChange("personalDetailsDTO", "dob", val);
                    validateField("dob", val);
                    if (val && message === "❌ Please select date of birth") setMessage("");
                  }}
                  className="modern-input"
                />
                {errors.dob && <small className="error">{errors.dob}</small>}
              </div>
              <div className="input-group">
                <label>Nationality <span className="required">*</span></label>
                <select
                  value={form.personalDetailsDTO.nationality}
                  onChange={(e) => handleChange("personalDetailsDTO", "nationality", e.target.value)}
                  className="modern-input"
                >
                  <option value="">Select Nationality</option>
                  <option value="Indian">Indian</option>
                  <option value="American">American</option>
                  <option value="British">British</option>
                  <option value="Other">Other</option>
                </select>
              </div>
              <div className="input-group">
                <label>Marital Status</label>
                <select
                  value={form.personalDetailsDTO.maritalStatus}
                  onChange={(e) => handleChange("personalDetailsDTO", "maritalStatus", e.target.value)}
                  className="modern-input"
                >
                  <option value="">Select Status</option>
                  <option value="Single">Single</option>
                  <option value="Married">Married</option>
                  <option value="Divorced">Divorced</option>
                </select>
              </div>
              <div className="input-group">
                <label>Blood Group <span className="required">*</span></label>
                <select
                  value={form.personalDetailsDTO.bloodGroup}
                  onChange={(e) => handleChange("personalDetailsDTO", "bloodGroup", e.target.value)}
                  className="modern-input"
                >
                  <option value="">Select Blood Group</option>
                  <option value="A+">A+</option>
                  <option value="A-">A-</option>
                  <option value="B+">B+</option>
                  <option value="B-">B-</option>
                  <option value="AB+">AB+</option>
                  <option value="AB-">AB-</option>
                  <option value="O+">O+</option>
                  <option value="O-">O-</option>
                </select>
              </div>
              <div className="input-group">
                <label>Aadhaar Number <span className="required">*</span></label>
                <input
                  value={form.personalDetailsDTO.aadhaarNumber}
                  onChange={(e) => {
                    let val = e.target.value.replace(/\D/g,"").slice(0,12);
                    handleChange("personalDetailsDTO", "aadhaarNumber", val);
                    validateField("aadhaar", val);
                  }}
                  placeholder="12-digit Aadhaar"
                  className="modern-input"
                />
                {errors.aadhaar && <small className="error">{errors.aadhaar}</small>}
              </div>
              <div className="input-group">
                <label>PAN Number <span className="required">*</span></label>
                <input
                  value={form.personalDetailsDTO.panNumber}
                  onChange={(e) => {
                    let val = e.target.value
                      .toUpperCase()
                      .replace(/[^A-Z0-9]/g, "")
                      .slice(0,10);

                    handleChange("personalDetailsDTO", "panNumber", val);
                    validateField("pan", val);
                  }}
                  placeholder="ABCDE1234F"
                  className="modern-input"
                />
                {errors.pan && <small className="error">{errors.pan}</small>}
              </div>
            </div>
          </div>
        );

      case 3:
        return (
          <div className="step-content">
            <div className="step-header">
              <h3>📞 Contact Information</h3>
              <p>Phone, email, and address details</p>
            </div>
            <div className="form-grid-2">
              <div className="input-group">
                <label>Phone Number <span className="required">*</span></label>
                <input
                  value={form.personalDetailsDTO.phoneNumber}
                  onChange={(e) => {
                    let val = e.target.value.replace(/\D/g,"").slice(0,10);
                    handleChange("personalDetailsDTO","phoneNumber",val);
                    validateField("phone",val);
                    if (val && message === "❌ Please enter phone number") setMessage("");
                  }}
                  placeholder="10-digit phone"
                  className="modern-input"
                />
                {errors.phone && <small className="error">{errors.phone}</small>}
              </div>
              <div className="input-group">
                <label>Email <span className="required">*</span></label>
                <input
                  type="text"
                  value={form.personalDetailsDTO.emailId}
                  onChange={(e)=>{
                    const val=e.target.value.toLowerCase();
                    handleChange("personalDetailsDTO","emailId",val);
                    validateField("email",val);
                    if (val && message === "❌ Please enter email") setMessage("");
                  }}
                  placeholder="example@domain.com"
                  className="modern-input"
                />
                {errors.email && <small className="error">{errors.email}</small>}
              </div>
              <div className="input-group full-width">
                <label>Current Address <span className="required">*</span></label>
                <textarea
                  value={form.personalDetailsDTO.address1}
                  onChange={(e)=>{
                    const val=e.target.value;
                    handleChange("personalDetailsDTO","address1",val);
                    validateField("address",val);
                    if (val && message === "❌ Please enter current address") setMessage("");
                  }}
                  rows="3"
                  className="modern-input"
                />
                {errors.address && <small className="error">{errors.address}</small>}
              </div>
              <div className="input-group full-width">
                <label>Permanent Address</label>
                <textarea
                  value={form.personalDetailsDTO.address2}
                  onChange={(e) => handleChange("personalDetailsDTO", "address2", e.target.value)}
                  rows="3"
                  placeholder="Enter permanent address"
                  className="modern-input"
                />
              </div>
              <div className="input-group">
                <label>Emergency Contact Name<span className="required">*</span></label>
                <input
                  value={form.personalDetailsDTO.emergencyContactName}
                  onChange={(e)=>{
                    let val=e.target.value.replace(/[^A-Za-z ]/g,"").slice(0,50);
                    handleChange("personalDetailsDTO","emergencyContactName",val);
                    validateField("emergencyName",val);
                  }}
                  className="modern-input"
                />
                {errors.emergencyName && <small className="error">{errors.emergencyName}</small>}
              </div>
              <div className="input-group">
                <label>Emergency Contact Relation<span className="required">*</span></label>
                <select
                  value={form.personalDetailsDTO.emergencyContactRelation}
                  onChange={(e) => handleChange("personalDetailsDTO", "emergencyContactRelation", e.target.value)}
                  className="modern-input"
                >
                  <option value="">Select Relation</option>
                  <option value="Father">Father</option>
                  <option value="Mother">Mother</option>
                  <option value="Spouse">Spouse</option>
                  <option value="Sibling">Sibling</option>
                  <option value="Friend">Friend</option>
                </select>
              </div>
              <div className="input-group">
                <label>Emergency Phone Number <span className="required">*</span></label>
                <input
                  value={form.personalDetailsDTO.emergencyPhoneNumber}
                  onChange={(e)=>{
                    let val=e.target.value.replace(/\D/g,"").slice(0,10);
                    handleChange("personalDetailsDTO","emergencyPhoneNumber",val);
                    validateField("emergencyPhone",val);
                  }}
                  className="modern-input"
                />
                {errors.emergencyPhone && <small className="error">{errors.emergencyPhone}</small>}
              </div>
            </div>
          </div>
        );

      case 4:
        return (
          <div className="step-content">
            <div className="step-header">
              <h3>💼 Job Details</h3>
              <p>Department, designation, and work information</p>
            </div>
            <div className="form-grid-2">
              <div className="input-group">
                <label>Department <span className="required">*</span></label>
                <select
                  value={form.jobDetailsDTO.departmentId}
                  onChange={(e) => {
                    handleChange("jobDetailsDTO", "departmentId", e.target.value);
                    if (e.target.value && message === "❌ Please select department") setMessage("");
                  }}
                  className="modern-input"
                >
                  <option value="">Select Department</option>
                  {departments.map((dept) => (
                    <option key={dept.id} value={dept.id}>{dept.departmentName}</option>
                  ))}
                </select>
              </div>
              <div className="input-group">
                <label>Designation <span className="required">*</span></label>
                <select
                  value={form.jobDetailsDTO.designationId}
                  onChange={(e) => {
                    handleChange("jobDetailsDTO", "designationId", e.target.value);
                    if (e.target.value && message === "❌ Please select designation") setMessage("");
                  }}
                  className="modern-input"
                >
                  <option value="">Select Designation</option>
                  {designations.map((des) => (
                    <option key={des.id} value={des.id}>{des.designationName}</option>
                  ))}
                </select>
              </div>
              <div className="input-group">
                <label>Date of Joining <span className="required">*</span></label>
                <input
                  type="date"
                  value={form.jobDetailsDTO.dateOfJoining}
                  onChange={(e) => {
                    handleChange("jobDetailsDTO", "dateOfJoining", e.target.value);
                    if (e.target.value && message === "❌ Please select date of joining") setMessage("");
                  }}
                  className="modern-input"
                />
              </div>
              <div className="input-group">
                <label>Work Location</label>
                <input
                  value={form.jobDetailsDTO.workLocation}
                  onChange={(e) => handleChange("jobDetailsDTO", "workLocation", e.target.value)}
                  placeholder="Enter work location"
                  className="modern-input"
                />
              </div>
            </div>
          </div>
        );

      case 5:
        return (
          <div className="step-content">
            <div className="step-header">
              <h3>👔 Manager Assignment</h3>
              <p>Search and assign a reporting manager</p>
            </div>
            <div className="manager-assignment">
              {selectedManager ? (
                <div className="selected-manager-card">
                  <div className="manager-info">
                    <h4>{selectedManager.personalDetailsDTO?.firstName} {selectedManager.personalDetailsDTO?.lastName}</h4>
                    <p>ID: {selectedManager.ftechUserId?.userid}</p>
                    <p>{selectedManager.personalDetailsDTO?.emailId}</p>
                  </div>
                  <button onClick={() => { setSelectedManager(null); setForm(prev => ({ ...prev, empMgrDto: { mgrId: "" } })); }} className="remove-btn">
                    Remove
                  </button>
                </div>
              ) : (
                <div className="manager-search">
                  <div className="search-input-wrapper">
                    <input
                      value={managerSearchValue}
                      onChange={(e) => setManagerSearchValue(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && handleManagerSearch()}
                      placeholder="Search manager by Employe Id,name or email"
                      className="modern-input"
                    />
                    <button onClick={handleManagerSearch} className="search-btn" disabled={managerSearchLoading}>
                      {managerSearchLoading ? "Searching..." : "Search"}
                    </button>
                  </div>
                  {showManagerSearch && managerSearchResults.length > 0 && (
                    <div className="manager-results">
                      {managerSearchResults.map((emp, idx) => (
                        <div key={idx} className="manager-result-item" onClick={() => selectManager(emp)}>
                          <h5>{emp.personalDetailsDTO?.firstName} {emp.personalDetailsDTO?.lastName}</h5>
                          <p>ID: {emp.ftechUserId?.userid} | {emp.personalDetailsDTO?.emailId}</p>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
              <p className="skip-note">Manager assignment is mandatory and cannot be skipped.</p>
            </div>
          </div>
        );

      case 6:
        return (
          <div className="step-content">
            <div className="step-header">
              <h3>🏦 Bank Details</h3>
              <p>Enter bank account information for salary processing</p>
            </div>
            <div className="form-grid-2">
              <div className="input-group">
                <label>Bank Name <span className="required">*</span></label>
                <input
                  value={form.bankDetailsDTO.bankName}
                  onChange={(e)=>{
                    let val=e.target.value.replace(/[^A-Za-z ]/g,"").slice(0,50);
                    handleChange("bankDetailsDTO","bankName",val);
                    validateField("bankName",val);
                    if (val && message === "❌ Please enter bank name") setMessage("");
                  }}
                  className="modern-input"
                />
                {errors.bankName && <small className="error">{errors.bankName}</small>}
              </div>
              <div className="input-group">
                <label>Account Number <span className="required">*</span></label>
                <input
                  value={form.bankDetailsDTO.accountNumber}
                  onChange={(e)=>{
                    let val=e.target.value.replace(/\D/g,"").slice(0,18);
                    handleChange("bankDetailsDTO","accountNumber",val);
                    validateField("accountNumber",val);
                    if (val && message === "❌ Please enter account number") setMessage("");
                  }}
                  className="modern-input"
                />
                {errors.accountNumber && <small className="error">{errors.accountNumber}</small>}
              </div>
              <div className="input-group">
                <label>IFSC Code <span className="required">*</span></label>
                <input
                  value={form.bankDetailsDTO.ifsc}
                  onChange={(e)=>{
                    let val=e.target.value.toUpperCase().replace(/[^A-Z0-9]/g,"").slice(0,11);
                    handleChange("bankDetailsDTO","ifsc",val);
                    validateField("ifsc",val);
                    if (val && message === "❌ Please enter IFSC code") setMessage("");
                  }}
                  placeholder="SBIN0001234"
                  className="modern-input"
                />
                {errors.ifsc && <small className="error">{errors.ifsc}</small>}
              </div>
              <div className="input-group">
                <label>Branch Name <span className="required">*</span></label>
                <input
                  value={form.bankDetailsDTO.branchName}
                  onChange={(e)=>{
                    let val=e.target.value.replace(/[^A-Za-z ]/g,"").slice(0,50);
                    handleChange("bankDetailsDTO","branchName",val);
                    validateField("branch",val);
                  }}
                  className="modern-input"
                />
                {errors.branch && <small className="error">{errors.branch}</small>}
              </div>
              <div className="input-group full-width">
                <label>Beneficiary Name <span className="required">*</span></label>
                <input
                  value={form.bankDetailsDTO.beneficiaryName}
                  onChange={(e)=>{
                    let val=e.target.value.replace(/[^A-Za-z ]/g,"").slice(0,50);
                    handleChange("bankDetailsDTO","beneficiaryName",val);
                    validateField("beneficiary",val);
                  }}
                  className="modern-input"
                />
                {errors.beneficiary && <small className="error">{errors.beneficiary}</small>}
              </div>
            </div>
          </div>
        );

      case 7:
        return (
          <div className="step-content">
            <div className="step-header">
              <h3>💰 Salary & Statutory Details</h3>
              <p>CTC and statutory information</p>
            </div>
            <div className="salary-calculation-info">
              <h4>Salary Breakdown</h4>
              <p>Basic: {percentages?.basic}% | HRA: {percentages?.hra}% | PF: {percentages?.pf}%</p>
            </div>
            <div className="form-grid-2">
              <div className="input-group full-width">
                <label>CTC (Annual) <span className="required">*</span></label>
                <input
                  type="number"
                  value={form.salaryDetailsDTO.ctc}
                  onChange={(e) => {
                    handleChange("salaryDetailsDTO", "ctc", e.target.value);
                    if (e.target.value && Number(e.target.value) > 0 && message === "❌ Please enter valid CTC amount") setMessage("");
                  }}
                  placeholder="Enter annual CTC"
                  className="modern-input"
                />
                <small className="helper-text">Salary components will auto-calculate</small>
              </div>
              <div className="input-group">
                <label>Basic Salary <span className="required">*</span></label>
                <input
                  type="number"
                  value={form.salaryDetailsDTO.basic}
                  readOnly
                  className="modern-input readonly"
                />
              </div>
              <div className="input-group">
                <label>HRA <span className="required">*</span></label>
                <input
                  type="number"
                  value={form.salaryDetailsDTO.hra}
                  readOnly
                  className="modern-input readonly"
                />
              </div>
              <div className="input-group">
                <label>PF<span className="required">*</span></label>
                <input
                  type="number"
                  value={form.salaryDetailsDTO.pf}
                  readOnly
                  className="modern-input readonly"
                />
              </div>
              <div className="input-group">
                <label>Conveyance Allowance<span className="required">*</span></label>
                <input
                  type="number"
                  value={form.salaryDetailsDTO.conveyanceAllowance}
                  readOnly
                  className="modern-input readonly"
                />
              </div>
              <div className="input-group net-salary-display">
                <label>Net Salary (Annual)<span className="required">*</span></label>
                <input
                  type="number"
                  value={netSalary}
                  readOnly
                  className="modern-input readonly highlight"
                />
              </div>
            </div>
            <div className="statutory-section">
              <h4>Statutory Details</h4>
              <div className="form-grid-2">
                <div className="input-group">
                  <label>PF UAN<span className="required">*</span></label>
                  <input
                    value={form.employeeStatutoryDetailsDTO.pfUan}
                    onChange={(e)=>{
                      let val=e.target.value.replace(/\D/g,"").slice(0,12);
                      handleChange("employeeStatutoryDetailsDTO","pfUan",val);
                      validateField("uan",val);
                    }}
                    placeholder="12-digit UAN"
                    className="modern-input"
                  />
                  {errors.uan && <small className="error">{errors.uan}</small>}
                </div>
                <div className="input-group">
                  <label>ESI Number<span className="required">*</span></label>
                  <input
                    value={form.employeeStatutoryDetailsDTO.esi}
                    onChange={(e)=>{
                      let val=e.target.value.replace(/\D/g,"").slice(0,10);
                      handleChange("employeeStatutoryDetailsDTO","esi",val);
                      validateField("esi",val);
                    }}
                    placeholder="10-digit ESI"
                    className="modern-input"
                  />
                  {errors.esi && <small className="error">{errors.esi}</small>}
                </div>
                <div className="input-group full-width">
                  <label>Medical Insurance Number<span className="required">*</span></label>
                  <input
                    value={form.employeeStatutoryDetailsDTO.min}
                    onChange={(e) => handleChange("employeeStatutoryDetailsDTO", "min", e.target.value)}
                    placeholder="Medical insurance number"
                    className="modern-input"
                  />
                </div>
              </div>
            </div>
          </div>
        );

      case 8:
        return (
          <div className="step-content">
            <div className="step-header">
              <h3>📄 Document Uploads</h3>
              <p>Upload required documents</p>
            </div>
            {mode === "edit" && existingDocuments.length > 0 && (
              <div className="existing-docs">
                <h4>Existing Documents</h4>
                {existingDocuments.map((doc) => (
                  <div key={doc.docId} className="doc-item">
                    <span>{doc.documentName}</span>
                    <span className="doc-file">{getFileNameFromPath(doc.docPath)}</span>
                  </div>
                ))}
              </div>
            )}
            <div className="document-upload-grid">
              {documents.map((doc) => {
                const isUploading = uploadingDocuments[doc.key];
                const existing = existingDocuments.find((d) => d.documentName === doc.documentName);

                return (
                  <div key={doc.id} className="doc-upload-card">
                    <div className="doc-header">
                      <h5>{doc.displayName}</h5>
                      {doc.mandatory && <span className="badge-required">Required</span>}
                      {!doc.mandatory && <span className="badge-optional">Optional</span>}
                    </div>
                    <input
                      type="file"
                      onChange={(e) => handleFileChange(doc.key, e.target.files[0])}
                      disabled={loading || isUploading}
                      accept={doc.fileType === "PDF" ? ".pdf" : ".jpg,.jpeg,.png"}
                      className="file-input"
                    />
                    {isUploading && <p className="uploading">Uploading...</p>}
                    {existing && <p className="uploaded">✓ {getFileNameFromPath(existing.docPath)}</p>}
                    {uploadedFiles[doc.key] && <p className="selected">Selected: {uploadedFiles[doc.key].name}</p>}
                  </div>
                );
              })}
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="modular-container">
      <div className="modular-card">
        {/* Header */}
        {/* <div className="modular-header">
          <h2>{mode === "create" ? "Create Employee" : "Edit Employee"}</h2>
          <button onClick={resetForm} className="reset-btn">Reset</button>
        </div> */}

        {/* Progress Bar */}
        <div className="progress-bar-container">
          <div className="progress-bar">
            <div 
              className="progress-fill" 
              style={{ width: `${(currentStep / totalSteps) * 100}%` }}
            />
          </div>
          <div className="step-indicators">
            {steps.map((step) => (
              <div
                key={step.number}
                className={`step-indicator 
  ${currentStep === step.number ? 'active' : ''} 
  ${completedSteps[step.number] ? 'completed' : ''}`}
                onClick={() => goToStep(step.number)}
              >
                <div className="step-number">
                 {completedSteps[step.number] ? '✓' : step.icon}
                </div>
                <span className="step-title">{step.title}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Step Content */}
        <div className="step-container">
          {renderStepContent()}
        </div>

        {/* Navigation Buttons */}
        <div className="navigation-buttons">
          {currentStep > 1 && (
            <button onClick={prevStep} className="nav-btn prev-btn">
              ← Previous
            </button>
          )}
          
          {/* {currentStep < totalSteps && (
            <button onClick={nextStep} className="nav-btn next-btn">
              Next →
            </button>
          )} */}
          {currentStep < totalSteps && currentStep !== 1 && (
  <button onClick={nextStep} className="nav-btn next-btn">
    Next →
  </button>
)}

          {currentStep === totalSteps && (
            <button onClick={submitEmployee} className="submit-btn" disabled={loading}>
              {loading ? "Processing..." : mode === "create" ? "Create Employee" : "Update Employee"}
            </button>
          )}
        </div>

        {/* Message */}
        {message && (
          <div className={`message-toast ${message.includes('✅') ? 'success' : message.includes('❌') ? 'error' : 'info'}`}>
            {message}
          </div>
        )}
      </div>
    </div>
  );
}

export default HrEmployeeManagement;