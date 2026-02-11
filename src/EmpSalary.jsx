import React, { useState } from "react";
import axios from "axios";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import companyLogo from "./assets/download.png";
import { FiDownload, FiCalendar, FiFileText, FiDollarSign } from "react-icons/fi";
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;
const EmpSalary = () => {
  const [selectedMonth, setSelectedMonth] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  /* ---------- Month Formatter ---------- */
  const formatMonthToWords = (yearMonth) => {
    if (!yearMonth) return "";
    const [year, month] = yearMonth.split("-");
    const monthNames = [
      "January", "February", "March", "April", "May", "June",
      "July", "August", "September", "October", "November", "December"
    ];
    return `${monthNames[parseInt(month) - 1]} ${year}`;
  };

  /* ---------- Number to Words ---------- */
  const numberToWords = (num) => {
    const a = ["", "One", "Two", "Three", "Four", "Five", "Six", "Seven", "Eight", "Nine", "Ten",
      "Eleven", "Twelve", "Thirteen", "Fourteen", "Fifteen", "Sixteen", "Seventeen",
      "Eighteen", "Nineteen"
    ];
    const b = ["", "", "Twenty", "Thirty", "Forty", "Fifty", "Sixty", "Seventy", "Eighty", "Ninety"];

    const inWords = (n) => {
      if (n < 20) return a[n];
      if (n < 100) return b[Math.floor(n / 10)] + (n % 10 ? " " + a[n % 10] : "");
      if (n < 1000)
        return a[Math.floor(n / 100)] + " Hundred" +
          (n % 100 ? " and " + inWords(n % 100) : "");
      if (n < 100000)
        return inWords(Math.floor(n / 1000)) + " Thousand" +
          (n % 1000 ? " " + inWords(n % 1000) : "");
      return "";
    };

    return `${inWords(Math.floor(num))} Rupees Only`;
  };

  /* ---------- Download Payslip PDF ---------- */
  const downloadPayslipPDF = async () => {
    if (!selectedMonth) {
      setMessage("Please select month");
      return;
    }

    try {
      setLoading(true);
      setMessage("");

      const [year, month] = selectedMonth.split("-");

      const res = await axios.get(
        `${API_BASE_URL}/salary/emp/payslip?month=${month}&year=${year}`,
        { withCredentials: true }
      );

      const data = res.data;

      const doc = new jsPDF();
      doc.setFont("times");

      const pdfWidth = doc.internal.pageSize.getWidth();

      const imgProps = doc.getImageProperties(companyLogo);
      const logoWidth = 25;
      const logoHeight = (imgProps.height * logoWidth) / imgProps.width;
      doc.addImage(companyLogo, "PNG", pdfWidth / 2 - logoWidth / 2, 10, logoWidth, logoHeight);

      doc.setFontSize(16);
      doc.setFont("times", "bold");
      doc.text("Venturebiz Promotions Private Limited", pdfWidth / 2, 35, { align: "center" });

      doc.setFontSize(10);
      doc.setFont("times", "normal");
      doc.text(
        "#2085/16, 2nd Floor, Spoorthi, Wilson Garden Society Layout,",
        pdfWidth / 2,
        42,
        { align: "center" }
      );
      doc.text(
        "Puttenahalli Main Road, JP Nagar 7th Phase, Bangalore-560078.",
        pdfWidth / 2,
        48,
        { align: "center" }
      );

      doc.setFontSize(12);
      doc.text(
        `Payslip for the month of ${formatMonthToWords(selectedMonth)}`,
        pdfWidth / 2,
        58,
        { align: "center" }
      );

      autoTable(doc, {
        startY: 65,
        theme: "grid",
        styles: { font: "times", fontSize: 9 },
        body: [
          ["Name", data.name, "Department", data.department],
          ["Designation", data.designation, "Location", data.location],
          ["Date of Joining", data.dateOfJoining, "Worked Days", data.workedDays],
          ["Days in Month", data.totalDays, "PF No", data.pfNo],
          ["ESI No", data.esiNo, "", ""]
        ]
      });

      autoTable(doc, {
        startY: doc.lastAutoTable.finalY + 10,
        head: [["EARNINGS", "AMOUNT", "DEDUCTIONS", "AMOUNT"]],
        theme: "grid",
        styles: { font: "times", fontSize: 9 },
        headStyles: { fillColor: [40, 40, 40] },
        body: [
          ["Basic", data.basic.toFixed(2), "PF", data.pf.toFixed(2)],
          ["HRA", data.hra.toFixed(2), "", ""],
          ["Conveyance", data.conveyance.toFixed(2), "", ""],
          ["Total Earnings", data.grossPay.toFixed(2), "Total Deductions", data.pf.toFixed(2)]
        ]
      });

      const finalY = doc.lastAutoTable.finalY + 15;
      doc.setFont("times", "bold");
      doc.text("Net Pay :", 14, finalY);
      doc.text(data.netPay.toFixed(2), 170, finalY);

      doc.setFont("times", "normal");
      doc.text(`*${numberToWords(data.netPay)}*`, 14, finalY + 8);

      doc.setFontSize(9);
      doc.text(
        "This is a system generated payslip and does not require signature",
        pdfWidth / 2,
        finalY + 20,
        { align: "center" }
      );

      doc.save(`Payslip_${month}_${year}.pdf`);
    } catch (err) {
      setMessage("Failed to download payslip");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.page}>
      <div style={styles.container}>
        {/* Header Section */}
        <div style={styles.header}>
          <div style={styles.headerIcon}>
            <FiFileText size={28} />
          </div>
          <div>
            <h1 style={styles.headerTitle}>Employee Payslip</h1>
            <p style={styles.headerSubtitle}>Download your monthly salary slips</p>
          </div>
        </div>

        {/* Main Card */}
        <div style={styles.card}>
          {message && (
            <div style={styles.messageBox}>
              <p style={styles.messageText}>{message}</p>
            </div>
          )}

          {/* Instructions */}
          <div style={styles.instructionBox}>
            <FiDollarSign size={20} style={styles.instructionIcon} />
            <div>
              <h3 style={styles.instructionTitle}>How to Download</h3>
              <p style={styles.instructionText}>
                Select a month and download your payslip. The document will include all salary details.
              </p>
            </div>
          </div>

          {/* Month Selection */}
          <div style={styles.inputGroup}>
            <label style={styles.label}>
              <FiCalendar style={styles.labelIcon} />
              Select Month
            </label>
            <input
              type="month"
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(e.target.value)}
              style={styles.input}
              max={new Date().toISOString().slice(0, 7)}
            />
            {selectedMonth && (
              <p style={styles.selectedMonthText}>
                Selected: <strong>{formatMonthToWords(selectedMonth)}</strong>
              </p>
            )}
          </div>

          {/* Download Button */}
          <button
            onClick={downloadPayslipPDF}
            disabled={loading || !selectedMonth}
            style={{
              ...styles.button,
              ...(loading || !selectedMonth ? styles.buttonDisabled : {}),
            }}
          >
            {loading ? (
              <>
                <div style={styles.spinner}></div>
                Processing...
              </>
            ) : (
              <>
                <FiDownload style={styles.buttonIcon} />
                Download Payslip
              </>
            )}
          </button>

          {/* Features List */}
          <div style={styles.featuresContainer}>
            <h3 style={styles.featuresTitle}>What's Included:</h3>
            <div style={styles.featuresGrid}>
              <div style={styles.featureItem}>
                <div style={styles.featureIcon}>✓</div>
                <span>Basic Salary Details</span>
              </div>
              <div style={styles.featureItem}>
                <div style={styles.featureIcon}>✓</div>
                <span>Allowances & Deductions</span>
              </div>
              <div style={styles.featureItem}>
                <div style={styles.featureIcon}>✓</div>
                <span>Employee Information</span>
              </div>
              <div style={styles.featureItem}>
                <div style={styles.featureIcon}>✓</div>
                <span>Net Pay in Words</span>
              </div>
            </div>
          </div>
        </div>

        {/* Footer Note */}
        <div style={styles.footerNote}>
          <p style={styles.footerText}>
            Your payslip will be downloaded as a PDF document. Keep it for your records.
          </p>
        </div>
      </div>
    </div>
  );
};

export default EmpSalary;

/* ---------- Enhanced Styles ---------- */
const styles = {
  page: {
    minHeight: "100vh",
    background: "linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    padding: "20px",
  },
  container: {
    width: "100%",
    maxWidth: "500px",
  },
  header: {
    display: "flex",
    alignItems: "center",
    gap: "15px",
    marginBottom: "30px",
    padding: "20px",
    background: "#ffffff",
    borderRadius: "12px",
    boxShadow: "0 4px 6px rgba(0, 0, 0, 0.05)",
  },
  headerIcon: {
    width: "60px",
    height: "60px",
    background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
    borderRadius: "12px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    color: "#ffffff",
  },
  headerTitle: {
    fontSize: "24px",
    fontWeight: "700",
    color: "#2d3748",
    margin: "0 0 5px 0",
  },
  headerSubtitle: {
    fontSize: "14px",
    color: "#718096",
    margin: "0",
  },
  card: {
    background: "#ffffff",
    borderRadius: "16px",
    padding: "32px",
    boxShadow: "0 10px 40px rgba(0, 0, 0, 0.08)",
    marginBottom: "20px",
  },
  messageBox: {
    backgroundColor: "#fed7d7",
    borderLeft: "4px solid #e53e3e",
    padding: "12px 16px",
    marginBottom: "24px",
    borderRadius: "4px",
  },
  messageText: {
    color: "#742a2a",
    margin: "0",
    fontSize: "14px",
    fontWeight: "500",
  },
  instructionBox: {
    display: "flex",
    alignItems: "flex-start",
    gap: "15px",
    backgroundColor: "#edf2f7",
    padding: "20px",
    borderRadius: "12px",
    marginBottom: "30px",
  },
  instructionIcon: {
    color: "#4299e1",
    flexShrink: "0",
  },
  instructionTitle: {
    fontSize: "16px",
    fontWeight: "600",
    color: "#2d3748",
    margin: "0 0 8px 0",
  },
  instructionText: {
    fontSize: "14px",
    color: "#4a5568",
    margin: "0",
    lineHeight: "1.5",
  },
  inputGroup: {
    marginBottom: "30px",
  },
  label: {
    display: "flex",
    alignItems: "center",
    gap: "8px",
    fontSize: "14px",
    fontWeight: "600",
    color: "#4a5568",
    marginBottom: "10px",
  },
  labelIcon: {
    color: "#718096",
  },
  input: {
    width: "100%",
    padding: "14px 16px",
    fontSize: "16px",
    border: "2px solid #e2e8f0",
    borderRadius: "10px",
    backgroundColor: "#f8fafc",
    color: "#2d3748",
    outline: "none",
    transition: "all 0.3s ease",
  },
  inputFocus: {
    borderColor: "#4299e1",
    boxShadow: "0 0 0 3px rgba(66, 153, 225, 0.1)",
  },
  selectedMonthText: {
    marginTop: "10px",
    fontSize: "14px",
    color: "#4a5568",
  },
  button: {
    width: "100%",
    padding: "16px",
    fontSize: "16px",
    fontWeight: "600",
    color: "#ffffff",
    background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
    border: "none",
    borderRadius: "10px",
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: "10px",
    transition: "all 0.3s ease",
    marginBottom: "30px",
  },
  buttonHover: {
    transform: "translateY(-2px)",
    boxShadow: "0 6px 20px rgba(102, 126, 234, 0.3)",
  },
  buttonDisabled: {
    background: "#cbd5e0",
    cursor: "not-allowed",
    transform: "none",
  },
  buttonIcon: {
    fontSize: "20px",
  },
  spinner: {
    width: "20px",
    height: "20px",
    border: "3px solid #ffffff",
    borderTop: "3px solid transparent",
    borderRadius: "50%",
    animation: "spin 1s linear infinite",
    marginRight: "10px",
  },
  featuresContainer: {
    borderTop: "1px solid #e2e8f0",
    paddingTop: "24px",
  },
  featuresTitle: {
    fontSize: "16px",
    fontWeight: "600",
    color: "#2d3748",
    marginBottom: "16px",
  },
  featuresGrid: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: "12px",
  },
  featureItem: {
    display: "flex",
    alignItems: "center",
    gap: "8px",
    fontSize: "14px",
    color: "#4a5568",
  },
  featureIcon: {
    width: "20px",
    height: "20px",
    background: "#48bb78",
    color: "#ffffff",
    borderRadius: "50%",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "12px",
    fontWeight: "bold",
  },
  footerNote: {
    textAlign: "center",
    padding: "16px",
  },
  footerText: {
    fontSize: "14px",
    color: "#718096",
    margin: "0",
  },
};

// Add CSS for spinner animation
const styleSheet = document.styleSheets[0];
styleSheet.insertRule(`
  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }
`, styleSheet.cssRules.length);