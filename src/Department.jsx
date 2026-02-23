// import { useState, useEffect } from "react";
// import axios from "axios";

// export default function Department() {
//   /* ======================
//      STATES
//      ====================== */
//   const [departments, setDepartments] = useState([]);
//   const [designations, setDesignations] = useState([]);

//   const [newDepartment, setNewDepartment] = useState("");
//   const [newDesignation, setNewDesignation] = useState("");

//   const [editingDept, setEditingDept] = useState(null);
//   const [editingDesg, setEditingDesg] = useState(null);
//   const [editDeptName, setEditDeptName] = useState("");
//   const [editDesgName, setEditDesgName] = useState("");

//   const [loadingDept, setLoadingDept] = useState(false);
//   const [loadingDesg, setLoadingDesg] = useState(false);

//   /* ======================
//      GET DEPARTMENTS
//      ====================== */
//   const fetchDepartments = async () => {
//     try {
//       const res = await axios.get(
//   `/api/departments`,
//   { withCredentials: true }
// );
//       setDepartments(res.data);
//     } catch (error) {
//       console.error(error);
//       alert("Unable to fetch departments");
//     }
//   };

//   /* ======================
//      GET DESIGNATIONS
//      ====================== */
//   const fetchDesignations = async () => {
//     try {
//       const res = await axios.get(
//   `/api/designations`,
//   { withCredentials: true }
// );
//       const cleaned = res.data.filter((d) => d.designationName !== null);
//       setDesignations(cleaned);
//     } catch (error) {
//       console.error(error);
//       alert("Unable to fetch designations");
//     }
//   };

//   /* ======================
//      INITIAL LOAD
//      ====================== */
//   useEffect(() => {
//     fetchDepartments();
//     fetchDesignations();
//   }, []);

//   /* ======================
//      CREATE DEPARTMENT
//      ====================== */
//   const addDepartment = async () => {
//     if (!newDepartment.trim()) {
//       alert("Department name is required");
//       return;
//     }

//     try {
//       setLoadingDept(true);
//      await axios.post(
//   `/api/departments`,
//   { departmentName: newDepartment },
//   { withCredentials: true }
// );
//       alert("Department created successfully");
//       setNewDepartment("");
//       fetchDepartments();
//     } catch (error) {
//       alert(error.response?.data?.message || "Create failed");
//     } finally {
//       setLoadingDept(false);
//     }
//   };

//   /* ======================
//      CREATE DESIGNATION
//      ====================== */
//   const addDesignation = async () => {
//     if (!newDesignation.trim()) {
//       alert("Designation name is required");
//       return;
//     }

//     try {
//       setLoadingDesg(true);
//       await axios.post(
//   `/api/dept/hr/DesignationName`,
//   { designationName: newDesignation },
//   { withCredentials: true }
// );
//       alert("Designation created successfully");
//       setNewDesignation("");
//       fetchDesignations();
//     } catch (error) {
//       alert(error.response?.data?.message || "Create failed");
//     } finally {
//       setLoadingDesg(false);
//     }
//   };

//   /* ======================
//      UPDATE DEPARTMENT
//      ====================== */
//   const updateDepartment = async (id) => {
//     if (!editDeptName.trim()) {
//       alert("Department name is required");
//       return;
//     }

//     try {
//      await axios.put(
//   `/api/departments/department-upate?departmentId=${id}`,
//   { departmentName: editDeptName },
//   { withCredentials: true }
// );
//       alert("Department updated successfully");
//       setEditingDept(null);
//       setEditDeptName("");
//       fetchDepartments();
//     } catch (error) {
//       alert(error.response?.data?.message || "Update failed");
//     }
//   };

//   /* ======================
//      UPDATE DESIGNATION
//      ====================== */
//   const updateDesignation = async (id) => {
//     if (!editDesgName.trim()) {
//       alert("Designation name is required");
//       return;
//     }

//     try {
// await axios.put(
//   `/api/designations/designation-update?designationId=${id}`,
//   { designationName: editDesgName },
//   { withCredentials: true }
// );
//       alert("Designation updated successfully");
//       setEditingDesg(null);
//       setEditDesgName("");
//       fetchDesignations();
//     } catch (error) {
//       alert(error.response?.data?.message || "Update failed");
//     }
//   };

//   /* ======================
//      START EDITING
//      ====================== */
//   const startEditDept = (dept) => {
//     setEditingDept(dept.id);
//     setEditDeptName(dept.departmentName);
//   };

//   const startEditDesg = (desg) => {
//     setEditingDesg(desg.id);
//     setEditDesgName(desg.designationName);
//   };

//   const cancelEdit = () => {
//     setEditingDept(null);
//     setEditingDesg(null);
//     setEditDeptName("");
//     setEditDesgName("");
//   };

//   return (
//     <div style={styles.page}>
//       <div style={styles.header}>
//         <h1 style={styles.heading}>Department & Designation Management</h1>
//         <p style={styles.subtitle}>Manage your organizational structure</p>
//       </div>

//       <div style={styles.gridContainer}>
//         {/* DEPARTMENTS CARD */}
//         <div style={styles.card}>
//           <div style={styles.cardHeader}>
//             <h3 style={styles.cardTitle}>Departments</h3>
//             <span style={styles.badge}>{departments.length} Total</span>
//           </div>

//           <div style={styles.inputGroup}>
//             <input
//               type="text"
//               placeholder="Enter department name..."
//               value={newDepartment}
//               onChange={(e) => setNewDepartment(e.target.value)}
//               style={styles.input}
//               onKeyPress={(e) => e.key === "Enter" && addDepartment()}
//             />
//             <button
//               onClick={addDepartment}
//               disabled={loadingDept}
//               style={styles.addButton}
//             >
//               {loadingDept ? "Adding..." : "➕ Add"}
//             </button>
//           </div>

//           <div style={styles.listContainer}>
//             {departments.length === 0 ? (
//               <div style={styles.emptyState}>
//                 <p>No departments yet. Add your first department above.</p>
//               </div>
//             ) : (
//               departments.map((dept) => (
//                 <div key={dept.id} style={styles.listItem}>
//                   {editingDept === dept.id ? (
//                     <div style={styles.editContainer}>
//                       <input
//                         type="text"
//                         value={editDeptName}
//                         onChange={(e) => setEditDeptName(e.target.value)}
//                         style={styles.editInput}
//                         autoFocus
//                       />
//                       <div style={styles.editActions}>
//                         <button
//                           onClick={() => updateDepartment(dept.id)}
//                           style={styles.saveButton}
//                           title="Save"
//                         >
//                           ✓
//                         </button>
//                         <button
//                           onClick={cancelEdit}
//                           style={styles.cancelButton}
//                           title="Cancel"
//                         >
//                           ✕
//                         </button>
//                       </div>
//                     </div>
//                   ) : (
//                     <>
//                       <span style={styles.itemText}>{dept.departmentName}</span>
//                       <div style={styles.actions}>
//                         <button
//                           onClick={() => startEditDept(dept)}
//                           style={styles.editButton}
//                           title="Edit"
//                         >
//                           ✎ Edit
//                         </button>
//                       </div>
//                     </>
//                   )}
//                 </div>
//               ))
//             )}
//           </div>
//         </div>

//         {/* DESIGNATIONS CARD */}
//         <div style={styles.card}>
//           <div style={styles.cardHeader}>
//             <h3 style={styles.cardTitle}>Designations</h3>
//             <span style={styles.badge}>{designations.length} Total</span>
//           </div>

//           <div style={styles.inputGroup}>
//             <input
//               type="text"
//               placeholder="Enter designation name..."
//               value={newDesignation}
//               onChange={(e) => setNewDesignation(e.target.value)}
//               style={styles.input}
//               onKeyPress={(e) => e.key === "Enter" && addDesignation()}
//             />
//             <button
//               onClick={addDesignation}
//               disabled={loadingDesg}
//               style={styles.addButton}
//             >
//               {loadingDesg ? "Adding..." : "➕ Add"}
//             </button>
//           </div>

//           <div style={styles.listContainer}>
//             {designations.length === 0 ? (
//               <div style={styles.emptyState}>
//                 <p>No designations yet. Add your first designation above.</p>
//               </div>
//             ) : (
//               designations.map((desg) => (
//                 <div key={desg.id} style={styles.listItem}>
//                   {editingDesg === desg.id ? (
//                     <div style={styles.editContainer}>
//                       <input
//                         type="text"
//                         value={editDesgName}
//                         onChange={(e) => setEditDesgName(e.target.value)}
//                         style={styles.editInput}
//                         autoFocus
//                       />
//                       <div style={styles.editActions}>
//                         <button
//                           onClick={() => updateDesignation(desg.id)}
//                           style={styles.saveButton}
//                           title="Save"
//                         >
//                           ✓
//                         </button>
//                         <button
//                           onClick={cancelEdit}
//                           style={styles.cancelButton}
//                           title="Cancel"
//                         >
//                           ✕
//                         </button>
//                       </div>
//                     </div>
//                   ) : (
//                     <>
//                       <span style={styles.itemText}>{desg.designationName}</span>
//                       <div style={styles.actions}>
//                         <button
//                           onClick={() => startEditDesg(desg)}
//                           style={styles.editButton}
//                           title="Edit"
//                         >
//                           ✎ Edit
//                         </button>
//                       </div>
//                     </>
//                   )}
//                 </div>
//               ))
//             )}
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// }

// /* ======================
//    PROFESSIONAL STYLES
//    ====================== */
// const styles = {
//   page: {
//     padding: "40px 20px",
//     backgroundColor: "#f8f9fa",
//     minHeight: "100vh",
//     fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
//   },
//   header: {
//     textAlign: "center",
//     marginBottom: "40px",
//   },
//   heading: {
//     fontSize: "32px",
//     fontWeight: "700",
//     background: "linear-gradient(135deg, #ff7a00, #ff9f43)",
//     WebkitBackgroundClip: "text",
//     WebkitTextFillColor: "transparent",
//     backgroundClip: "text",
//     marginBottom: "8px",
//   },
//   subtitle: {
//     fontSize: "16px",
//     color: "#6b7280",
//     fontWeight: "400",
//     margin: 0,
//   },
//   gridContainer: {
//     display: "grid",
//     gridTemplateColumns: "repeat(auto-fit, minmax(450px, 1fr))",
//     gap: "30px",
//     maxWidth: "1200px",
//     margin: "0 auto",
//   },
//   card: {
//     backgroundColor: "#ffffff",
//     borderRadius: "16px",
//     padding: "30px",
//     boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)",
//     transition: "transform 0.2s ease, box-shadow 0.2s ease",
//   },
//   cardHeader: {
//     display: "flex",
//     justifyContent: "space-between",
//     alignItems: "center",
//     marginBottom: "24px",
//     paddingBottom: "16px",
//     borderBottom: "2px solid #f3f4f6",
//   },
//   cardTitle: {
//     fontSize: "20px",
//     fontWeight: "600",
//     color: "#111827",
//     margin: 0,
//   },
//   badge: {
//     backgroundColor: "#fff7ed",
//     color: "#f97316",
//     padding: "6px 14px",
//     borderRadius: "20px",
//     fontSize: "13px",
//     fontWeight: "600",
//   },
//   inputGroup: {
//     display: "flex",
//     gap: "12px",
//     marginBottom: "24px",
//   },
//   input: {
//     flex: 1,
//     padding: "12px 16px",
//     borderRadius: "10px",
//     border: "2px solid #e5e7eb",
//     fontSize: "15px",
//     outline: "none",
//     transition: "border-color 0.2s ease",
//     backgroundColor: "#fafafa",
//     fontFamily: "inherit",
//   },
//   addButton: {
//     padding: "12px 24px",
//     borderRadius: "10px",
//     border: "none",
//     background: "linear-gradient(135deg, #ff7a00, #ff9f43)",
//     color: "#ffffff",
//     cursor: "pointer",
//     fontSize: "15px",
//     fontWeight: "600",
//     transition: "all 0.2s ease",
//     whiteSpace: "nowrap",
//     boxShadow: "0 2px 8px rgba(255, 122, 0, 0.3)",
//   },
//   listContainer: {
//     maxHeight: "450px",
//     overflowY: "auto",
//     paddingRight: "4px",
//   },
//   listItem: {
//     display: "flex",
//     justifyContent: "space-between",
//     alignItems: "center",
//     padding: "14px 16px",
//     marginBottom: "8px",
//     borderRadius: "10px",
//     backgroundColor: "#fafafa",
//     border: "1px solid #e5e7eb",
//     transition: "all 0.2s ease",
//   },
//   itemText: {
//     fontSize: "15px",
//     color: "#374151",
//     fontWeight: "500",
//     flex: 1,
//   },
//   actions: {
//     display: "flex",
//     gap: "8px",
//   },
//   editButton: {
//     padding: "8px 16px",
//     borderRadius: "8px",
//     border: "none",
//     backgroundColor: "#3b82f6",
//     color: "#ffffff",
//     cursor: "pointer",
//     transition: "all 0.2s ease",
//     display: "flex",
//     alignItems: "center",
//     justifyContent: "center",
//     fontSize: "14px",
//     fontWeight: "500",
//   },
//   editContainer: {
//     display: "flex",
//     gap: "12px",
//     width: "100%",
//     alignItems: "center",
//   },
//   editInput: {
//     flex: 1,
//     padding: "10px 14px",
//     borderRadius: "8px",
//     border: "2px solid #3b82f6",
//     fontSize: "15px",
//     outline: "none",
//     backgroundColor: "#ffffff",
//     fontFamily: "inherit",
//   },
//   editActions: {
//     display: "flex",
//     gap: "8px",
//   },
//   saveButton: {
//     padding: "8px 16px",
//     borderRadius: "8px",
//     border: "none",
//     backgroundColor: "#10b981",
//     color: "#ffffff",
//     cursor: "pointer",
//     transition: "all 0.2s ease",
//     display: "flex",
//     alignItems: "center",
//     justifyContent: "center",
//     fontSize: "18px",
//     fontWeight: "bold",
//   },
//   cancelButton: {
//     padding: "8px 16px",
//     borderRadius: "8px",
//     border: "none",
//     backgroundColor: "#6b7280",
//     color: "#ffffff",
//     cursor: "pointer",
//     transition: "all 0.2s ease",
//     display: "flex",
//     alignItems: "center",
//     justifyContent: "center",
//     fontSize: "18px",
//     fontWeight: "bold",
//   },
//   emptyState: {
//     textAlign: "center",
//     padding: "40px 20px",
//     color: "#9ca3af",
//     fontSize: "15px",
//   },
// };


// import { useState, useEffect } from "react";
// import axios from "axios";

// export default function Department() {
//   /* ======================
//      STATES
//      ====================== */
//   const [departments, setDepartments] = useState([]);
//   const [designations, setDesignations] = useState([]);

//   const [newDepartment, setNewDepartment] = useState("");
//   const [newDesignation, setNewDesignation] = useState("");

//   const [editingDept, setEditingDept] = useState(null);
//   const [editingDesg, setEditingDesg] = useState(null);
//   const [editDeptName, setEditDeptName] = useState("");
//   const [editDesgName, setEditDesgName] = useState("");

//   const [loadingDept, setLoadingDept] = useState(false);
//   const [loadingDesg, setLoadingDesg] = useState(false);

//   /* ======================
//      GET DEPARTMENTS
//      ====================== */
//   const fetchDepartments = async () => {
//     try {
//       const res = await axios.get(
//   `/api/departments`,
//   { withCredentials: true }
// );
//       setDepartments(res.data);
//     } catch (error) {
//       console.error(error);
//       alert("Unable to fetch departments");
//     }
//   };

//   /* ======================
//      GET DESIGNATIONS
//      ====================== */
//   const fetchDesignations = async () => {
//     try {
//       const res = await axios.get(
//   `/api/designations`,
//   { withCredentials: true }
// );
//       const cleaned = res.data.filter((d) => d.designationName !== null);
//       setDesignations(cleaned);
//     } catch (error) {
//       console.error(error);
//       alert("Unable to fetch designations");
//     }
//   };

//   /* ======================
//      INITIAL LOAD
//      ====================== */
//   useEffect(() => {
//     fetchDepartments();
//     fetchDesignations();
//   }, []);

//   /* ======================
//      CREATE DEPARTMENT
//      ====================== */
//   const addDepartment = async () => {
//     if (!newDepartment.trim()) {
//       alert("Department name is required");
//       return;
//     }

//     try {
//       setLoadingDept(true);
//      await axios.post(
//   `/api/departments`,
//   { departmentName: newDepartment },
//   { withCredentials: true }
// );
//       alert("Department created successfully");
//       setNewDepartment("");
//       fetchDepartments();
//     } catch (error) {
//       alert(error.response?.data?.message || "Create failed");
//     } finally {
//       setLoadingDept(false);
//     }
//   };

//   /* ======================
//      CREATE DESIGNATION
//      ====================== */
//   const addDesignation = async () => {
//     if (!newDesignation.trim()) {
//       alert("Designation name is required");
//       return;
//     }

//     try {
//       setLoadingDesg(true);
//       await axios.post(
//   `/api/dept/hr/DesignationName`,
//   { designationName: newDesignation },
//   { withCredentials: true }
// );
//       alert("Designation created successfully");
//       setNewDesignation("");
//       fetchDesignations();
//     } catch (error) {
//       alert(error.response?.data?.message || "Create failed");
//     } finally {
//       setLoadingDesg(false);
//     }
//   };

//   /* ======================
//      UPDATE DEPARTMENT
//      ====================== */
//   const updateDepartment = async (id) => {
//     if (!editDeptName.trim()) {
//       alert("Department name is required");
//       return;
//     }

//     try {
//      await axios.put(
//   `/api/departments/department-update?departmentId=${id}`,
//   { departmentName: editDeptName },
//   { withCredentials: true }
// );
//       alert("Department updated successfully");
//       setEditingDept(null);
//       setEditDeptName("");
//       fetchDepartments();
//     } catch (error) {
//       alert(error.response?.data?.message || "Update failed");
//     }
//   };

//   /* ======================
//      UPDATE DESIGNATION
//      ====================== */
//   const updateDesignation = async (id) => {
//     if (!editDesgName.trim()) {
//       alert("Designation name is required");
//       return;
//     }

//     try {
// await axios.put(
//   `/api/designations/designation-update?designationId=${id}`,
//   { designationName: editDesgName },
//   { withCredentials: true }
// );
//       alert("Designation updated successfully");
//       setEditingDesg(null);
//       setEditDesgName("");
//       fetchDesignations();
//     } catch (error) {
//       alert(error.response?.data?.message || "Update failed");
//     }
//   };

//   /* ======================
//      START EDITING
//      ====================== */
//   const startEditDept = (dept) => {
//     setEditingDept(dept.id);
//     setEditDeptName(dept.departmentName);
//   };

//   const startEditDesg = (desg) => {
//     setEditingDesg(desg.id);
//     setEditDesgName(desg.designationName);
//   };

//   const cancelEdit = () => {
//     setEditingDept(null);
//     setEditingDesg(null);
//     setEditDeptName("");
//     setEditDesgName("");
//   };

//   return (
//     <div style={styles.page}>
//       <div style={styles.header}>
//         <h1 style={styles.heading}>Department & Designation Management</h1>
//         <p style={styles.subtitle}>Manage your organizational structure</p>
//       </div>

//       <div style={styles.gridContainer}>
//         {/* DEPARTMENTS CARD */}
//         <div style={styles.card}>
//           <div style={styles.cardHeader}>
//             <h3 style={styles.cardTitle}>Departments</h3>
//             <span style={styles.badge}>{departments.length} Total</span>
//           </div>

//           <div style={styles.inputGroup}>
//             <input
//               type="text"
//               placeholder="Enter department name..."
//               value={newDepartment}
//               onChange={(e) => setNewDepartment(e.target.value)}
//               style={styles.input}
//               onKeyPress={(e) => e.key === "Enter" && addDepartment()}
//             />
//             <button
//               onClick={addDepartment}
//               disabled={loadingDept}
//               style={styles.addButton}
//             >
//               {loadingDept ? "Adding..." : "➕ Add"}
//             </button>
//           </div>

//           <div style={styles.listContainer}>
//             {departments.length === 0 ? (
//               <div style={styles.emptyState}>
//                 <p>No departments yet. Add your first department above.</p>
//               </div>
//             ) : (
//               departments.map((dept) => (
//                 <div key={dept.id} style={styles.listItem}>
//                   {editingDept === dept.id ? (
//                     <div style={styles.editContainer}>
//                       <input
//                         type="text"
//                         value={editDeptName}
//                         onChange={(e) => setEditDeptName(e.target.value)}
//                         style={styles.editInput}
//                         autoFocus
//                       />
//                       <div style={styles.editActions}>
//                         <button
//                           onClick={() => updateDepartment(dept.id)}
//                           style={styles.saveButton}
//                           title="Save"
//                         >
//                           ✓
//                         </button>
//                         <button
//                           onClick={cancelEdit}
//                           style={styles.cancelButton}
//                           title="Cancel"
//                         >
//                           ✕
//                         </button>
//                       </div>
//                     </div>
//                   ) : (
//                     <>
//                       <span style={styles.itemText}>{dept.departmentName}</span>
//                       <div style={styles.actions}>
//                         <button
//                           onClick={() => startEditDept(dept)}
//                           style={styles.editButton}
//                           title="Edit"
//                         >
//                           ✎ Edit
//                         </button>
//                       </div>
//                     </>
//                   )}
//                 </div>
//               ))
//             )}
//           </div>
//         </div>

//         {/* DESIGNATIONS CARD */}
//         <div style={styles.card}>
//           <div style={styles.cardHeader}>
//             <h3 style={styles.cardTitle}>Designations</h3>
//             <span style={styles.badge}>{designations.length} Total</span>
//           </div>

//           <div style={styles.inputGroup}>
//             <input
//               type="text"
//               placeholder="Enter designation name..."
//               value={newDesignation}
//               onChange={(e) => setNewDesignation(e.target.value)}
//               style={styles.input}
//               onKeyPress={(e) => e.key === "Enter" && addDesignation()}
//             />
//             <button
//               onClick={addDesignation}
//               disabled={loadingDesg}
//               style={styles.addButton}
//             >
//               {loadingDesg ? "Adding..." : "➕ Add"}
//             </button>
//           </div>

//           <div style={styles.listContainer}>
//             {designations.length === 0 ? (
//               <div style={styles.emptyState}>
//                 <p>No designations yet. Add your first designation above.</p>
//               </div>
//             ) : (
//               designations.map((desg) => (
//                 <div key={desg.id} style={styles.listItem}>
//                   {editingDesg === desg.id ? (
//                     <div style={styles.editContainer}>
//                       <input
//                         type="text"
//                         value={editDesgName}
//                         onChange={(e) => setEditDesgName(e.target.value)}
//                         style={styles.editInput}
//                         autoFocus
//                       />
//                       <div style={styles.editActions}>
//                         <button
//                           onClick={() => updateDesignation(desg.id)}
//                           style={styles.saveButton}
//                           title="Save"
//                         >
//                           ✓
//                         </button>
//                         <button
//                           onClick={cancelEdit}
//                           style={styles.cancelButton}
//                           title="Cancel"
//                         >
//                           ✕
//                         </button>
//                       </div>
//                     </div>
//                   ) : (
//                     <>
//                       <span style={styles.itemText}>{desg.designationName}</span>
//                       <div style={styles.actions}>
//                         <button
//                           onClick={() => startEditDesg(desg)}
//                           style={styles.editButton}
//                           title="Edit"
//                         >
//                           ✎ Edit
//                         </button>
//                       </div>
//                     </>
//                   )}
//                 </div>
//               ))
//             )}
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// }

// /* ======================
//    PROFESSIONAL STYLES
//    ====================== */
// const styles = {
//   page: {
//     padding: "40px 20px",
//     backgroundColor: "#f8f9fa",
//     minHeight: "100vh",
//     fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
//   },
//   header: {
//     textAlign: "center",
//     marginBottom: "40px",
//   },
//   heading: {
//     fontSize: "32px",
//     fontWeight: "700",
//     background: "linear-gradient(135deg, #ff7a00, #ff9f43)",
//     WebkitBackgroundClip: "text",
//     WebkitTextFillColor: "transparent",
//     backgroundClip: "text",
//     marginBottom: "8px",
//   },
//   subtitle: {
//     fontSize: "16px",
//     color: "#6b7280",
//     fontWeight: "400",
//     margin: 0,
//   },
//   gridContainer: {
//     display: "grid",
//     gridTemplateColumns: "repeat(auto-fit, minmax(450px, 1fr))",
//     gap: "30px",
//     maxWidth: "1200px",
//     margin: "0 auto",
//   },
//   card: {
//     backgroundColor: "#ffffff",
//     borderRadius: "16px",
//     padding: "30px",
//     boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)",
//     transition: "transform 0.2s ease, box-shadow 0.2s ease",
//   },
//   cardHeader: {
//     display: "flex",
//     justifyContent: "space-between",
//     alignItems: "center",
//     marginBottom: "24px",
//     paddingBottom: "16px",
//     borderBottom: "2px solid #f3f4f6",
//   },
//   cardTitle: {
//     fontSize: "20px",
//     fontWeight: "600",
//     color: "#111827",
//     margin: 0,
//   },
//   badge: {
//     backgroundColor: "#fff7ed",
//     color: "#f97316",
//     padding: "6px 14px",
//     borderRadius: "20px",
//     fontSize: "13px",
//     fontWeight: "600",
//   },
//   inputGroup: {
//     display: "flex",
//     gap: "12px",
//     marginBottom: "24px",
//   },
//   input: {
//     flex: 1,
//     padding: "12px 16px",
//     borderRadius: "10px",
//     border: "2px solid #e5e7eb",
//     fontSize: "15px",
//     outline: "none",
//     transition: "border-color 0.2s ease",
//     backgroundColor: "#fafafa",
//     fontFamily: "inherit",
//   },
//   addButton: {
//     padding: "12px 24px",
//     borderRadius: "10px",
//     border: "none",
//     background: "linear-gradient(135deg, #ff7a00, #ff9f43)",
//     color: "#ffffff",
//     cursor: "pointer",
//     fontSize: "15px",
//     fontWeight: "600",
//     transition: "all 0.2s ease",
//     whiteSpace: "nowrap",
//     boxShadow: "0 2px 8px rgba(255, 122, 0, 0.3)",
//   },
//   listContainer: {
//     maxHeight: "450px",
//     overflowY: "auto",
//     paddingRight: "4px",
//   },
//   listItem: {
//     display: "flex",
//     justifyContent: "space-between",
//     alignItems: "center",
//     padding: "14px 16px",
//     marginBottom: "8px",
//     borderRadius: "10px",
//     backgroundColor: "#fafafa",
//     border: "1px solid #e5e7eb",
//     transition: "all 0.2s ease",
//   },
//   itemText: {
//     fontSize: "15px",
//     color: "#374151",
//     fontWeight: "500",
//     flex: 1,
//   },
//   actions: {
//     display: "flex",
//     gap: "8px",
//   },
//   editButton: {
//     padding: "8px 16px",
//     borderRadius: "8px",
//     border: "none",
//     backgroundColor: "#3b82f6",
//     color: "#ffffff",
//     cursor: "pointer",
//     transition: "all 0.2s ease",
//     display: "flex",
//     alignItems: "center",
//     justifyContent: "center",
//     fontSize: "14px",
//     fontWeight: "500",
//   },
//   editContainer: {
//     display: "flex",
//     gap: "12px",
//     width: "100%",
//     alignItems: "center",
//   },
//   editInput: {
//     flex: 1,
//     padding: "10px 14px",
//     borderRadius: "8px",
//     border: "2px solid #3b82f6",
//     fontSize: "15px",
//     outline: "none",
//     backgroundColor: "#ffffff",
//     fontFamily: "inherit",
//   },
//   editActions: {
//     display: "flex",
//     gap: "8px",
//   },
//   saveButton: {
//     padding: "8px 16px",
//     borderRadius: "8px",
//     border: "none",
//     backgroundColor: "#10b981",
//     color: "#ffffff",
//     cursor: "pointer",
//     transition: "all 0.2s ease",
//     display: "flex",
//     alignItems: "center",
//     justifyContent: "center",
//     fontSize: "18px",
//     fontWeight: "bold",
//   },
//   cancelButton: {
//     padding: "8px 16px",
//     borderRadius: "8px",
//     border: "none",
//     backgroundColor: "#6b7280",
//     color: "#ffffff",
//     cursor: "pointer",
//     transition: "all 0.2s ease",
//     display: "flex",
//     alignItems: "center",
//     justifyContent: "center",
//     fontSize: "18px",
//     fontWeight: "bold",
//   },
//   emptyState: {
//     textAlign: "center",
//     padding: "40px 20px",
//     color: "#9ca3af",
//     fontSize: "15px",
//   },
// 


import { useState, useEffect } from "react";
import axios from "axios";
 
export default function Department() {
  /* ======================
     STATES
     ====================== */
  const [departments, setDepartments] = useState([]);
  const [designations, setDesignations] = useState([]);
 
  const [newDepartment, setNewDepartment] = useState("");
  const [newDesignation, setNewDesignation] = useState("");
  const [deptError, setDeptError] = useState("");
  const [desgError, setDesgError] = useState("");
 
  const [deptFilter, setDeptFilter] = useState("");
  const [desgFilter, setDesgFilter] = useState("");
 
  const [editingDept, setEditingDept] = useState(null);
  const [editingDesg, setEditingDesg] = useState(null);
  const [editDeptName, setEditDeptName] = useState("");
  const [editDesgName, setEditDesgName] = useState("");
 
  const [loadingDept, setLoadingDept] = useState(false);
  const [loadingDesg, setLoadingDesg] = useState(false);
 
  /* ======================
     GET DEPARTMENTS
     ====================== */
  const fetchDepartments = async () => {
    try {
      const res = await axios.get(
  `/api/departments`,
  { withCredentials: true }
);
      setDepartments(res.data);
    } catch (error) {
      console.error(error);
      alert("Unable to fetch departments");
    }
  };
 
  /* ======================
     GET DESIGNATIONS
     ====================== */
  const fetchDesignations = async () => {
    try {
      const res = await axios.get(
  `/api/designations`,
  { withCredentials: true }
);
      const cleaned = res.data.filter((d) => d.designationName !== null);
      setDesignations(cleaned);
    } catch (error) {
      console.error(error);
      alert("Unable to fetch designations");
    }
  };
 
  /* ======================
     INITIAL LOAD
     ====================== */
  useEffect(() => {
    fetchDepartments();
    fetchDesignations();
  }, []);
 
  /* ======================
     CREATE DEPARTMENT
     ====================== */
  const addDepartment = async () => {
    // Validation: Only letters, min 2, max 30 chars
    const deptVal = newDepartment.trim();
    if (!deptVal) {
      setDeptError("Department name is required");
      return;
    }
    if (!/^[A-Za-z ]{2,30}$/.test(deptVal)) {
      setDeptError("Only letters allowed, 2-30 chars");
      return;
    }
    setDeptError("");
 
    try {
      setLoadingDept(true);
     await axios.post(
  `/api/departments`,
  { departmentName: newDepartment },
  { withCredentials: true }
);
      alert("Department created successfully");
      setNewDepartment("");
      fetchDepartments();
    } catch (error) {
      alert(error.response?.data?.message || "Create failed");
    } finally {
      setLoadingDept(false);
    }
  };
 
  /* ======================
     CREATE DESIGNATION
     ====================== */
  const addDesignation = async () => {
    // Validation: Only letters, min 2, max 30 chars
    const desgVal = newDesignation.trim();
    if (!desgVal) {
      setDesgError("Designation name is required");
      return;
    }
    if (!/^[A-Za-z ]{2,30}$/.test(desgVal)) {
      setDesgError("Only letters allowed, 2-30 chars");
      return;
    }
    setDesgError("");
 
    try {
      setLoadingDesg(true);
      await axios.post(
  `/api/dept/hr/DesignationName`,
  { designationName: newDesignation },
  { withCredentials: true }
);
      alert("Designation created successfully");
      setNewDesignation("");
      fetchDesignations();
    } catch (error) {
      alert(error.response?.data?.message || "Create failed");
    } finally {
      setLoadingDesg(false);
    }
  };
 
  /* ======================
     UPDATE DEPARTMENT
     ====================== */
  const updateDepartment = async (id) => {
    if (!editDeptName.trim()) {
      alert("Department name is required");
      return;
    }
 
    try {
     await axios.put(
  `/api/departments/department-upate?departmentId=${id}`,
  { departmentName: editDeptName },
  { withCredentials: true }
);
      alert("Department updated successfully");
      setEditingDept(null);
      setEditDeptName("");
      fetchDepartments();
    } catch (error) {
      alert(error.response?.data?.message || "Update failed");
    }
  };
 
  /* ======================
     UPDATE DESIGNATION
     ====================== */
  const updateDesignation = async (id) => {
    if (!editDesgName.trim()) {
      alert("Designation name is required");
      return;
    }
 
    try {
await axios.put(
  `/api/designations/designation-update?designationId=${id}`,
  { designationName: editDesgName },
  { withCredentials: true }
);
      alert("Designation updated successfully");
      setEditingDesg(null);
      setEditDesgName("");
      fetchDesignations();
    } catch (error) {
      alert(error.response?.data?.message || "Update failed");
    }
  };
 
  /* ======================
     START EDITING
     ====================== */
  const startEditDept = (dept) => {
    setEditingDept(dept.id);
    setEditDeptName(dept.departmentName);
  };
 
  const startEditDesg = (desg) => {
    setEditingDesg(desg.id);
    setEditDesgName(desg.designationName);
  };
 
  const cancelEdit = () => {
    setEditingDept(null);
    setEditingDesg(null);
    setEditDeptName("");
    setEditDesgName("");
  };
 
  return (
    <div style={styles.page}>
      <div style={styles.header}>
        <h1 style={styles.heading}>Department & Designation Management</h1>
        <p style={styles.subtitle}>Manage your organizational structure</p>
      </div>
 
      <div style={styles.gridContainer}>
        {/* DEPARTMENTS CARD */}
        <div style={styles.card}>
          <div style={styles.cardHeader}>
            <h3 style={styles.cardTitle}>Departments</h3>
            <span style={styles.badge}>{departments.length} Total</span>
          </div>
 
          <div style={styles.inputGroup}>
            <input
              type="text"
              placeholder="Enter department name..."
              value={newDepartment}
              onChange={(e) => {
                const rawVal = e.target.value;
                if (/[^A-Za-z ]/.test(rawVal)) {
                  setDeptError("Numbers and special characters are not allowed");
                } else {
                  setDeptError("");
                }
                const val = rawVal.replace(/[^A-Za-z ]/g, "");
                setNewDepartment(val);
              }}
              style={styles.input}
              onKeyPress={(e) => e.key === "Enter" && addDepartment()}
              maxLength={30}
            />
            <button
              onClick={addDepartment}
              disabled={loadingDept}
              style={styles.addButton}
            >
              {loadingDept ? "Adding..." : "➕ Add"}
            </button>
          </div>
          {deptError && (
            <div style={{ color: 'red', fontSize: '13px', marginBottom: '8px' }}>{deptError}</div>
          )}

          <div style={styles.filterGroup}>
            <input
              type="text"
              placeholder="Filter departments..."
              value={deptFilter}
              onChange={(e) => setDeptFilter(e.target.value)}
              style={styles.filterInput}
            />
          </div>
 
          <div style={styles.listContainer}>
            {departments.length === 0 ? (
              <div style={styles.emptyState}>
                <p>No departments yet. Add your first department above.</p>
              </div>
            ) : (
              departments
                .filter(dept => dept.departmentName.toLowerCase().includes(deptFilter.toLowerCase()))
                .map((dept) => (
                <div key={dept.id} style={styles.listItem}>
                  {editingDept === dept.id ? (
                    <div style={styles.editContainer}>
                      <input
                        type="text"
                        value={editDeptName}
                        onChange={(e) => setEditDeptName(e.target.value)}
                        style={styles.editInput}
                        autoFocus
                      />
                      <div style={styles.editActions}>
                        <button
                          onClick={() => updateDepartment(dept.id)}
                          style={styles.saveButton}
                          title="Save"
                        >
                          ✓
                        </button>
                        <button
                          onClick={cancelEdit}
                          style={styles.cancelButton}
                          title="Cancel"
                        >
                          ✕
                        </button>
                      </div>
                    </div>
                  ) : (
                    <>
                      <span style={styles.itemText}>{dept.departmentName}</span>
                      <div style={styles.actions}>
                        <button
                          onClick={() => startEditDept(dept)}
                          style={styles.editButton}
                          title="Edit"
                        >
                          ✎ Edit
                        </button>
                      </div>
                    </>
                  )}
                </div>
              ))
            )}
          </div>
        </div>
 
        {/* DESIGNATIONS CARD */}
        <div style={styles.card}>
          <div style={styles.cardHeader}>
            <h3 style={styles.cardTitle}>Designations</h3>
            <span style={styles.badge}>{designations.length} Total</span>
          </div>
 
          <div style={styles.inputGroup}>
            <input
              type="text"
              placeholder="Enter designation name..."
              value={newDesignation}
              onChange={(e) => {
                const rawVal = e.target.value;
                if (/[^A-Za-z ]/.test(rawVal)) {
                  setDesgError("Numbers and special characters are not allowed");
                } else {
                  setDesgError("");
                }
                const val = rawVal.replace(/[^A-Za-z ]/g, "");
                setNewDesignation(val);
              }}
              style={styles.input}
              onKeyPress={(e) => e.key === "Enter" && addDesignation()}
              maxLength={30}
            />
            <button
              onClick={addDesignation}
              disabled={loadingDesg}
              style={styles.addButton}
            >
              {loadingDesg ? "Adding..." : "➕ Add"}
            </button>
          </div>
          {desgError && (
            <div style={{ color: 'red', fontSize: '13px', marginBottom: '8px' }}>{desgError}</div>
          )}

          <div style={styles.filterGroup}>
            <input
              type="text"
              placeholder="Filter designations..."
              value={desgFilter}
              onChange={(e) => setDesgFilter(e.target.value)}
              style={styles.filterInput}
            />
          </div>
 
          <div style={styles.listContainer}>
            {designations.length === 0 ? (
              <div style={styles.emptyState}>
                <p>No designations yet. Add your first designation above.</p>
              </div>
            ) : (
              designations
                .filter(desg => desg.designationName.toLowerCase().includes(desgFilter.toLowerCase()))
                .map((desg) => (
                <div key={desg.id} style={styles.listItem}>
                  {editingDesg === desg.id ? (
                    <div style={styles.editContainer}>
                      <input
                        type="text"
                        value={editDesgName}
                        onChange={(e) => setEditDesgName(e.target.value)}
                        style={styles.editInput}
                        autoFocus
                      />
                      <div style={styles.editActions}>
                        <button
                          onClick={() => updateDesignation(desg.id)}
                          style={styles.saveButton}
                          title="Save"
                        >
                          ✓
                        </button>
                        <button
                          onClick={cancelEdit}
                          style={styles.cancelButton}
                          title="Cancel"
                        >
                          ✕
                        </button>
                      </div>
                    </div>
                  ) : (
                    <>
                      <span style={styles.itemText}>{desg.designationName}</span>
                      <div style={styles.actions}>
                        <button
                          onClick={() => startEditDesg(desg)}
                          style={styles.editButton}
                          title="Edit"
                        >
                          ✎ Edit
                        </button>
                      </div>
                    </>
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
 
/* ======================
   PROFESSIONAL STYLES
   ====================== */
const styles = {
  page: {
    padding: "40px 20px",
    backgroundColor: "#f8f9fa",
    minHeight: "100vh",
    fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
  },
  header: {
    textAlign: "center",
    marginBottom: "40px",
  },
  heading: {
    fontSize: "32px",
    fontWeight: "700",
    background: "linear-gradient(135deg, #ff7a00, #ff9f43)",
    WebkitBackgroundClip: "text",
    WebkitTextFillColor: "transparent",
    backgroundClip: "text",
    marginBottom: "8px",
  },
  subtitle: {
    fontSize: "16px",
    color: "#6b7280",
    fontWeight: "400",
    margin: 0,
  },
  gridContainer: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
    gap: "20px",
    maxWidth: "1200px",
    margin: "0 auto",
  },
  card: {
    backgroundColor: "#ffffff",
    borderRadius: "16px",
    padding: "20px",
    boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)",
    transition: "transform 0.2s ease, box-shadow 0.2s ease",
  },
  cardHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "24px",
    paddingBottom: "16px",
    borderBottom: "2px solid #f3f4f6",
  },
  cardTitle: {
    fontSize: "20px",
    fontWeight: "600",
    color: "#111827",
    margin: 0,
  },
  badge: {
    backgroundColor: "#fff7ed",
    color: "#f97316",
    padding: "6px 14px",
    borderRadius: "20px",
    fontSize: "13px",
    fontWeight: "600",
  },
  inputGroup: {
    display: "flex",
    gap: "12px",
    marginBottom: "24px",
  },
  filterGroup: {
    display: "flex",
    gap: "12px",
    marginBottom: "16px",
  },
  filterInput: {
    flex: 1,
    padding: "8px 12px",
    borderRadius: "8px",
    border: "1px solid #d1d5db",
    fontSize: "14px",
    outline: "none",
    backgroundColor: "#ffffff",
    fontFamily: "inherit",
  },
  input: {
    flex: 1,
    padding: "12px 16px",
    borderRadius: "10px",
    border: "2px solid #e5e7eb",
    fontSize: "15px",
    outline: "none",
    transition: "border-color 0.2s ease",
    backgroundColor: "#fafafa",
    fontFamily: "inherit",
  },
  addButton: {
    padding: "12px 24px",
    borderRadius: "10px",
    border: "none",
    background: "linear-gradient(135deg, #ff7a00, #ff9f43)",
    color: "#ffffff",
    cursor: "pointer",
    fontSize: "15px",
    fontWeight: "600",
    transition: "all 0.2s ease",
    whiteSpace: "nowrap",
    boxShadow: "0 2px 8px rgba(255, 122, 0, 0.3)",
  },
  listContainer: {
    maxHeight: "450px",
    overflowY: "auto",
    paddingRight: "4px",
  },
  listItem: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "14px 16px",
    marginBottom: "8px",
    borderRadius: "10px",
    backgroundColor: "#fafafa",
    border: "1px solid #e5e7eb",
    transition: "all 0.2s ease",
  },
  itemText: {
    fontSize: "15px",
    color: "#374151",
    fontWeight: "500",
    flex: 1,
  },
  actions: {
    display: "flex",
    gap: "8px",
  },
  editButton: {
    padding: "8px 16px",
    borderRadius: "8px",
    border: "none",
    backgroundColor: "#3b82f6",
    color: "#ffffff",
    cursor: "pointer",
    transition: "all 0.2s ease",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "14px",
    fontWeight: "500",
  },
  editContainer: {
    display: "flex",
    gap: "12px",
    width: "100%",
    alignItems: "center",
  },
  editInput: {
    flex: 1,
    padding: "10px 14px",
    borderRadius: "8px",
    border: "2px solid #3b82f6",
    fontSize: "15px",
    outline: "none",
    backgroundColor: "#ffffff",
    fontFamily: "inherit",
  },
  editActions: {
    display: "flex",
    gap: "8px",
  },
  saveButton: {
    padding: "8px 16px",
    borderRadius: "8px",
    border: "none",
    backgroundColor: "#10b981",
    color: "#ffffff",
    cursor: "pointer",
    transition: "all 0.2s ease",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "18px",
    fontWeight: "bold",
  },
  cancelButton: {
    padding: "8px 16px",
    borderRadius: "8px",
    border: "none",
    backgroundColor: "#6b7280",
    color: "#ffffff",
    cursor: "pointer",
    transition: "all 0.2s ease",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "18px",
    fontWeight: "bold",
  },
  emptyState: {
    textAlign: "center",
    padding: "40px 20px",
    color: "#9ca3af",
    fontSize: "15px",
  },
};