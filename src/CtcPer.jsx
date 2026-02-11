import api from "./api";
import React, { useEffect, useState } from "react";
import axios from "axios";
import "./HrCalculateSalary.css";

export default function SalaryConfiguration() {
  const [form, setForm] = useState({
    id: null,
    basicPercentage: "",
    hraPercentage: "",
    pfPercentage: ""
  });

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [configExists, setConfigExists] = useState(false);
  // Load existing configuration on component mount
  useEffect(() => {
    fetchSalaryConfig();
  }, []);

  const fetchSalaryConfig = async () => {
    try {
      setLoading(true);
      console.log("Fetching salary configuration...");

   const response = await axios.get(
  `/api/salary/calculator/get`,
  {
    withCredentials: true,
    headers: { 'Content-Type': 'application/json' }
  }
);

console.log("API Response:", response.data);

      

      // Handle different response formats
      let configData = null;
      
      // If response.data exists and has data
      if (response.data) {
        if (Array.isArray(response.data) && response.data.length > 0) {
          // Response is an array
          configData = response.data[0];
          console.log("Using array data:", configData);
        } else if (typeof response.data === 'object' && Object.keys(response.data).length > 0) {
          // Response is an object
          configData = response.data;
          console.log("Using object data:", configData);
        }
      }

      if (configData && 
          (configData.id !== undefined || 
           configData.basicPercentage !== undefined ||
           configData.hraPercentage !== undefined ||
           configData.pfPercentage !== undefined)) {
        
        // Configuration exists
        setForm({
          id: configData.id || null,
          basicPercentage: configData.basicPercentage?.toString() || "",
          hraPercentage: configData.hraPercentage?.toString() || "",
          pfPercentage: configData.pfPercentage?.toString() || ""
        });
        
        setConfigExists(true);
        setMessage("✅ Configuration loaded successfully");
        console.log("Config exists:", true, "Form:", form);
      } else {
        // No configuration exists yet
        resetForm();
        setConfigExists(false);
        setMessage("⚠️ No configuration found. You can create one.");
        console.log("No config found");
      }
      
    } catch (error) {
      console.error("Error fetching config:", error);
      
      // Check if it's a 500 error from backend (might mean no data yet)
      if (error.response?.status === 500) {
        // This could mean no data exists yet in database
        resetForm();
        setConfigExists(false);
        setMessage("⚠️ No configuration found yet. You can create one.");
      } else if (error.response?.status === 400 || error.response?.status === 404) {
        // No configuration exists - this is OK for first-time setup
        resetForm();
        setConfigExists(false);
        setMessage("⚠️ No configuration found. You can create one.");
      } else {
        setMessage("❌ Error loading configuration");
      }
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setForm({
      id: null,
      basicPercentage: "",
      hraPercentage: "",
      pfPercentage: ""
    });
  };

  const validateForm = () => {
    const errors = {};
    
    // Check if all fields are filled
    if (!form.basicPercentage.trim()) {
      errors.basic = "Basic percentage is required";
    } else {
      const basicValue = parseFloat(form.basicPercentage);
      if (isNaN(basicValue) || basicValue <= 0 || basicValue > 100) {
        errors.basic = "Basic percentage must be between 0.01 and 100";
      }
    }
    
    if (!form.hraPercentage.trim()) {
      errors.hra = "HRA percentage is required";
    } else {
      const hraValue = parseFloat(form.hraPercentage);
      if (isNaN(hraValue) || hraValue < 0 || hraValue > 100) {
        errors.hra = "HRA percentage must be between 0 and 100";
      }
    }
    
    if (!form.pfPercentage.trim()) {
      errors.pf = "PF percentage is required";
    } else {
      const pfValue = parseFloat(form.pfPercentage);
      if (isNaN(pfValue) || pfValue < 0 || pfValue > 100) {
        errors.pf = "PF percentage must be between 0 and 100";
      }
    }
    
    return errors;
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    
    // Allow only numbers, decimal point, and empty string
    if (value === "" || /^\d*\.?\d*$/.test(value)) {
      // Limit to 2 decimal places
      const decimalParts = value.split('.');
      if (decimalParts.length > 1 && decimalParts[1].length > 2) {
        return; // Don't update if more than 2 decimal places
      }
      
      setForm(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  const handleBlur = (e) => {
    const { name, value } = e.target;
    
    // Format to 2 decimal places on blur if it's a valid number
    if (value && value.trim() !== "" && !isNaN(value)) {
      const num = parseFloat(value);
      if (!isNaN(num)) {
        setForm(prev => ({
          ...prev,
          [name]: num.toFixed(2)
        }));
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validate form
    const errors = validateForm();
    if (Object.keys(errors).length > 0) {
      // Show errors
      const errorText = Object.values(errors).join("\n");
      setMessage(`❌ Please fix the following:\n${errorText}`);
      return;
    }
    
    try {
      setSaving(true);
      setMessage("");
      
      const payload = {
        basicPercentage: parseFloat(form.basicPercentage),
        hraPercentage: parseFloat(form.hraPercentage),
        pfPercentage: parseFloat(form.pfPercentage)
      };
      
      console.log("Submitting payload:", payload);
      console.log("Config exists?", configExists);
      console.log("Form ID:", form.id);
      
      let response;
      
      if (configExists && form.id) {
        // UPDATE existing configuration (can edit anytime)
        console.log("Updating config with ID:", form.id);
      const response = await axios.put(
  `/api/salary/update/${form.id}`,
  payload,
  {
    withCredentials: true,
    headers: { 'Content-Type': 'application/json' }
  }
);


        
        console.log("Update response:", response.data);
        setMessage("✅ Configuration updated successfully");
        
        // Refresh to get updated data
        setTimeout(() => {
          fetchSalaryConfig();
        }, 1000);
        
      } else {
        // CREATE new configuration (only allowed if none exists - ONE TIME)
        console.log("Creating new config (One-time)");
        
        try {
          const response = await axios.post(
  `/api/salary/calculator`,
  payload,
  {
    withCredentials: true,
    headers: { 'Content-Type': 'application/json' }
  }
);

console.log("Create response:", response.data);
          
          if (response.status === 200 || response.status === 201) {
            // Update the form with the new ID from response
            if (response.data && (response.data.id || response.data.configId)) {
              const newId = response.data.id || response.data.configId;
              setForm(prev => ({
                ...prev,
                id: newId
              }));
              setConfigExists(true);
            }
            setMessage("✅ Configuration created successfully (One-time setup complete)");
            
            // Refresh to get the new config
            setTimeout(() => {
              fetchSalaryConfig();
            }, 1000);
          }
          
        } catch (createError) {
          console.error("Create error:", createError);
          
          if (createError.response?.status === 500) {
            if (createError.response?.data?.includes?.("already exists") || 
                createError.response?.data?.message?.includes?.("already exists")) {
              // Configuration already exists, fetch it
              setMessage("⚠️ Configuration already exists. Loading existing configuration...");
              setTimeout(() => {
                fetchSalaryConfig();
              }, 1000);
            } else {
              setMessage("❌ Server error during creation");
            }
          } else {
            setMessage(`❌ Error: ${createError.response?.data?.message || createError.message}`);
          }
        }
      }
      
    } catch (error) {
      console.error("Error saving configuration:", error);
      console.error("Error response:", error.response?.data);
      
      if (error.response?.status === 500) {
        setMessage("❌ Server error. Please try again.");
      } else if (error.response?.status === 400) {
        setMessage("❌ Invalid data. Please check your inputs.");
      } else {
        setMessage(`❌ Error: ${error.response?.data?.message || error.message}`);
      }
    } finally {
      setSaving(false);
    }
  };

  const handleReset = () => {
    if (configExists) {
      // Just reset to current values from server
      fetchSalaryConfig();
      setMessage("Form reset to current configuration");
    } else {
      resetForm();
      setMessage("Form cleared");
    }
  };

  // Debug: Test API directly
  const testApiDirectly = async () => {
    try {
      console.log("Testing API directly...");
      const response = await fetch("/api/salary/calculator/get", {
        credentials: 'include'
      });
      console.log("Direct fetch status:", response.status);
      const data = await response.json();
      console.log("Direct fetch data:", data);
      
      if (response.ok) {
        setMessage(`✅ API test successful. Data: ${JSON.stringify(data)}`);
      } else {
        setMessage(`❌ API test failed: ${response.status}`);
      }
    } catch (err) {
      console.error("Direct fetch error:", err);
      setMessage(`❌ API test error: ${err.message}`);
    }
  };

  if (loading) {
    return (
      <div className="salary-calc-page">
        <div className="salary-calc-card">
          <div className="loading">
            <h2>Loading Configuration...</h2>
            <p>Checking for existing salary configuration...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="salary-calc-page">
      <div className="salary-calc-card">
        <h2>Salary Configuration</h2>
        
        <p className="subtitle">
          {configExists 
            ? "Edit salary calculation percentages (Can update anytime)" 
            : "Create salary calculation percentages (One-time setup only)"}
        </p>
        
        {message && (
          <div className={`message ${message.includes("✅") ? "success" : message.includes("⚠️") ? "warning" : "error"}`}>
            {message.split('\n').map((line, index) => (
              <div key={index}>{line}</div>
            ))}
          </div>
        )}
        
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="basicPercentage">
              Basic Percentage (% of CTC) *
            </label>
            <input
              id="basicPercentage"
              type="text"
              name="basicPercentage"
              value={form.basicPercentage}
              onChange={handleInputChange}
              onBlur={handleBlur}
              placeholder="e.g., 40.00"
              disabled={saving}
              required
            />
            <small className="field-note">Percentage of CTC for Basic Salary</small>
          </div>
          
          <div className="form-group">
            <label htmlFor="hraPercentage">
              HRA Percentage (% of Basic) *
            </label>
            <input
              id="hraPercentage"
              type="text"
              name="hraPercentage"
              value={form.hraPercentage}
              onChange={handleInputChange}
              onBlur={handleBlur}
              placeholder="e.g., 20.00"
              disabled={saving}
              required
            />
            <small className="field-note">Percentage of Basic Salary for HRA</small>
          </div>
          
          <div className="form-group">
            <label htmlFor="pfPercentage">
              PF Percentage (% of Basic) *
            </label>
            <input
              id="pfPercentage"
              type="text"
              name="pfPercentage"
              value={form.pfPercentage}
              onChange={handleInputChange}
              onBlur={handleBlur}
              placeholder="e.g., 12.00"
              disabled={saving}
              required
            />
            <small className="field-note">Percentage of Basic Salary for PF</small>
          </div>
          
          <div className="button-group">
            <button
              type="submit"
              className="save-btn"
              disabled={saving}
            >
              {saving 
                ? "Processing..." 
                : configExists 
                  ? "Update Configuration" 
                  : "Create Configuration (One-time)"}
            </button>
            
            <button
              type="button"
              className="reset-btn"
              onClick={handleReset}
              disabled={saving}
            >
              {configExists ? "Refresh" : "Clear"}
            </button>
          </div>
        </form>
        
        <div className="info-box">
          <h4>Important Rules:</h4>
          <ul>

            <li>
              <strong>Adding:</strong> Can only be done <strong>once</strong> when no configuration exists
            </li>
            <li>
              <strong>Editing:</strong> Can be done <strong>anytime</strong> once configuration exists
            </li>
            
            
            
          </ul>
          

          
        </div>
        
       
      </div>
    </div>
  );
}
