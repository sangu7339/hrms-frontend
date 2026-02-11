import React, { useEffect, useState } from "react";
import axios from "axios";
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;
export default function LeaveMasterManagement() {
  const [leaves, setLeaves] = useState([]);
  const [form, setForm] = useState({
    leaveId: "",
    leaveName: "",
    noOfDays: ""
  });
  const [editId, setEditId] = useState(null);

  const BASE_URL = API_BASE_URL;

  // 🔄 Fetch all leave types
  const fetchLeaves = async () => {
    try {
      const res = await axios.get(`${BASE_URL}/leave-master/all`);
      setLeaves(res.data);
    } catch (e) {
      console.error("Fetch error", e);
    }
  };

  useEffect(() => {
    fetchLeaves();
  }, []);

  // ✍️ Handle input
  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  // ➕ Create / ✏️ Update
  const handleSubmit = async () => {
    try {
      if (editId) {
        await axios.put(
          `${BASE_URL}/leave-master/updateLeaveMaster/${editId}`,
          form
        );
        alert("Leave updated");
      } else {
        await axios.post(`${BASE_URL}/leave-master/create`, form);
        alert("Leave created");
      }

      setForm({ leaveId: "", leaveName: "", noOfDays: "" });
      setEditId(null);
      fetchLeaves();
    } catch (e) {
      console.error(e);
      alert("Error saving leave");
    }
  };

  // 🗑 Delete
  const handleDelete = async (id) => {
    if (!window.confirm("Delete this leave type?")) return;

    await axios.delete(`${BASE_URL}/leave-master/deleteLeaveMaster/${id}`);
    fetchLeaves();
  };

  // ✏️ Edit
  const handleEdit = (leave) => {
    setForm(leave);
    setEditId(leave.leaveId);
  };

  return (
    <div style={{ padding: 40 }}>
      <h2>Leave Master Management</h2>

      <div style={{ marginBottom: 20 }}>
        <input
          name="leaveName"
          placeholder="Leave Name (e.g. Casual Leave)"
          value={form.leaveName}
          onChange={handleChange}
        />
        <input
          name="noOfDays"
          type="number"
          placeholder="No Of Days"
          value={form.noOfDays}
          onChange={handleChange}
        />
        <button onClick={handleSubmit}>
          {editId ? "Update Leave" : "Add Leave"}
        </button>
      </div>

      <table border="1" cellPadding="10">
        <thead>
          <tr>
            <th>ID</th>
            <th>Leave Name</th>
            <th>No Of Days</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {leaves.map((l) => (
            <tr key={l.leaveId}>
              <td>{l.leaveId}</td>
              <td>{l.leaveName}</td>
              <td>{l.noOfDays}</td>
              <td>
                <button onClick={() => handleEdit(l)}>Edit</button>
                <button onClick={() => handleDelete(l.leaveId)}>Delete</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}