// components/Dashboard.js

import React, { useContext, useEffect, useState } from "react";
import { Context } from "../main";
import { Navigate, Link, Route, Routes, useLocation } from "react-router-dom";
import axios from "axios";
import { toast } from "react-toastify";
import { GoCheckCircleFill } from "react-icons/go";
import { AiFillCloseCircle } from "react-icons/ai";
import Modal from "react-modal";
import JobApplicationDetail from "./JobApplicationDetail";
import "./Dashboard.css";
import Papa from "papaparse";

// Setting the app element for accessibility
Modal.setAppElement("#root");

const Dashboard = () => {
  const yy = "https://backend1-96bk.onrender.com";
  const [jobApplications, setJobApplications] = useState([]);
  const [filteredApplications, setFilteredApplications] = useState([]);
  const [modalIsOpen, setModalIsOpen] = useState(false);
  const [proofUrl, setProofUrl] = useState("");
  const [filters, setFilters] = useState({
    cgpa: "",
    hsc: "",
    ssc: "",
    gap_year: "",
    branch: "",
  });

  // State variables for the email modal
  const [emailModalIsOpen, setEmailModalIsOpen] = useState(false);
  const [emailSubject, setEmailSubject] = useState("");
  const [emailContent, setEmailContent] = useState("");

  const location = useLocation();

  useEffect(() => {
    // Read query parameters and set filters accordingly
    const params = new URLSearchParams(location.search);
    const cgpa = params.get("cgpa") || "";
    const hsc = params.get("hsc") || "";
    const ssc = params.get("ssc") || "";
    const gap_year = params.get("gap_year") || "";
    const branch = params.get("branch") || "";

    setFilters({
      cgpa,
      hsc,
      ssc,
      gap_year,
      branch,
    });
  }, [location.search]);

  useEffect(() => {
    const fetchJobApplications = async () => {
      try {
        const { data } = await axios.get(`${yy}/api/v1/jobApplication/getall`, {
          withCredentials: true,
        });
        setJobApplications(data.jobApplications);
        setFilteredApplications(data.jobApplications);
      } catch (error) {
        setJobApplications([]);
        setFilteredApplications([]);
        toast.error("Failed to fetch job applications.");
      }
    };
    fetchJobApplications();
  }, []);

  const handleUpdateStatus = async (jobApplicationId, field, value) => {
    try {
      const { data } = await axios.put(
        `${yy}/api/v1/jobApplication/update/${jobApplicationId}`,
        { [field]: value },
        { withCredentials: true }
      );
      setJobApplications((prevJobApplications) =>
        prevJobApplications.map((jobApplication) =>
          jobApplication._id === jobApplicationId
            ? { ...jobApplication, [field]: value }
            : jobApplication
        )
      );
      setFilteredApplications((prevFilteredApplications) =>
        prevFilteredApplications.map((jobApplication) =>
          jobApplication._id === jobApplicationId
            ? { ...jobApplication, [field]: value }
            : jobApplication
        )
      );
      toast.success(data.message);
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to update status.");
    }
  };

  const openModal = (url) => {
    setProofUrl(url);
    setModalIsOpen(true);
  };

  const closeModal = () => {
    setModalIsOpen(false);
    setProofUrl("");
  };

  const handleInputChange = (jobApplicationId, field, value) => {
    setJobApplications((prevJobApplications) =>
      prevJobApplications.map((jobApplication) =>
        jobApplication._id === jobApplicationId
          ? { ...jobApplication, [field]: value }
          : jobApplication
      )
    );
  };

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters((prevFilters) => ({ ...prevFilters, [name]: value }));
  };

  useEffect(() => {
    const filtered = jobApplications.filter((application) => {
      return (
        (filters.cgpa === "" || application.cgpa >= parseFloat(filters.cgpa)) &&
        (filters.hsc === "" || application.hsc >= parseFloat(filters.hsc)) &&
        (filters.ssc === "" || application.ssc >= parseFloat(filters.ssc)) &&
        (filters.gap_year === "" ||
          (application.gap_year &&
            application.gap_year <= parseInt(filters.gap_year))) &&
        (filters.branch === "" || application.branch === filters.branch)
      );
    });
    setFilteredApplications(filtered);
  }, [filters, jobApplications]);

  const { isAuthenticated, admin } = useContext(Context);
  if (!isAuthenticated) {
    return <Navigate to={"/login"} />;
  }

  const handleDownloadCSV = () => {
    const csvData = filteredApplications.map((application) => ({
      "Full Name": application.fullName,
      "Registration Number": application.reg,
      CGPA: application.cgpa,
      "HSC Marks": application.hsc,
      "SSC Marks": application.ssc,
      Department: application.branch,
      Status: application.status,
      Placed: application.placed,
      Package: application.amount,
      Email: application.email,
    }));

    const csv = Papa.unparse(csvData);

    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", "job_applications.csv");
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleSendEmails = async () => {
    const emailAddresses = filteredApplications.map(
      (application) => application.email
    );

    try {
      const { data } = await axios.post(
        `${yy}/api/v1/sendEmail`,
        {
          recipients: emailAddresses,
          subject: emailSubject,
          message: emailContent,
        },
        { withCredentials: true }
      );
      toast.success(data.message);
      setEmailModalIsOpen(false);
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to send emails.");
    }
  };

  return (
    <>
      <Routes>
        <Route
          path="/"
          element={
            <section className="dashboard page">
              <div className="filter-section">
                <h5>Filter Student Applications</h5>
                <div className="filters">
                  <input
                    type="number"
                    name="cgpa"
                    placeholder="Min CGPA"
                    value={filters.cgpa}
                    onChange={handleFilterChange}
                  />
                  <input
                    type="number"
                    name="hsc"
                    placeholder="Min HSC Marks"
                    value={filters.hsc}
                    onChange={handleFilterChange}
                  />
                  <input
                    type="number"
                    name="ssc"
                    placeholder="Min SSC Marks"
                    value={filters.ssc}
                    onChange={handleFilterChange}
                  />
                  <input
                    type="number"
                    name="gap_year"
                    placeholder="Max Gap Year"
                    value={filters.gap_year}
                    onChange={handleFilterChange}
                  />
                  <input
                    name="branch"
                    placeholder="Branch"
                    value={filters.branch}
                    onChange={handleFilterChange}
                  />
                  <button className="csv-button" onClick={handleDownloadCSV}>
                    Download CSV
                  </button>
                  <button
                    className="csv-button"
                    onClick={() => setEmailModalIsOpen(true)}
                  >
                    Send Emails
                  </button>
                </div>
              </div>
              <div className="banner p-10">
                <h5>Student Applications</h5>
                <div className="table-container">
                  <table className="styled-table">
                    <thead>
                      <tr>
                        <th>Full Name</th>
                        <th>Registration Number</th>
                        <th>CGPA</th>
                        <th>HSC Marks</th>
                        <th>SSC Marks</th>
                        <th>Department</th>
                        <th>Status</th>
                        <th>Placed</th>
                        <th>Package</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredApplications.length > 0 ? (
                        filteredApplications.map((application) => (
                          <tr key={application._id}>
                            <td>{application.fullName}</td>
                            <td>
                              <Link to={`/job-application/${application.reg}`}>
                                {application.reg}
                              </Link>
                            </td>
                            <td>{application.cgpa}</td>
                            <td>{application.hsc}</td>
                            <td>{application.ssc}</td>
                            <td>{application.branch}</td>
                            <td>
                              <select
                                className={
                                  application.status === "Pending"
                                    ? "value-pending"
                                    : application.status === "Accepted"
                                    ? "value-accepted"
                                    : "value-rejected"
                                }
                                value={application.status}
                                onChange={(e) =>
                                  handleUpdateStatus(
                                    application._id,
                                    "status",
                                    e.target.value
                                  )
                                }
                              >
                                <option
                                  value="Pending"
                                  className="value-pending"
                                >
                                  Pending
                                </option>
                                <option
                                  value="Accepted"
                                  className="value-accepted"
                                >
                                  Accepted
                                </option>
                                <option
                                  value="Rejected"
                                  className="value-rejected"
                                >
                                  Rejected
                                </option>
                              </select>
                            </td>
                            <td>
                              <select
                                value={application.placed}
                                onChange={(e) =>
                                  handleUpdateStatus(
                                    application._id,
                                    "placed",
                                    e.target.value
                                  )
                                }
                              >
                                <option value="Placed">Placed</option>
                                <option value="Rejected">Rejected</option>
                              </select>
                            </td>
                            <td>
                              <input
                                type="number"
                                value={application.amount || ""}
                                placeholder="Package"
                                onChange={(e) =>
                                  handleUpdateStatus(
                                    application._id,
                                    "amount",
                                    e.target.value
                                  )
                                }
                              />
                            </td>
                            <td>
                              <button
                                className="button"
                                onClick={() => openModal(application.proof.url)}
                              >
                                View Proof
                              </button>
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan="10" className="no-applications">
                            No job applications found.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
              <Modal
                isOpen={modalIsOpen}
                onRequestClose={closeModal}
                contentLabel="Proof Modal"
                className="modal"
              >
                <button className="close-modal" onClick={closeModal}>
                  <AiFillCloseCircle />
                </button>
                {proofUrl && <img src={proofUrl} alt="Proof" />}
              </Modal>
              <Modal
                isOpen={emailModalIsOpen}
                onRequestClose={() => setEmailModalIsOpen(false)}
                contentLabel="Email Modal"
                className="modal"
              >
                <button
                  className="close-modal"
                  onClick={() => setEmailModalIsOpen(false)}
                >
                  <AiFillCloseCircle />
                </button>
                <h2>Email Content</h2>
                <div>
                  <label>Email Subject</label>
                  <input
                    type="text"
                    value={emailSubject}
                    onChange={(e) => setEmailSubject(e.target.value)}
                  />
                </div>
                <div>
                  <label>Email Content</label>
                  <textarea
                    value={emailContent}
                    onChange={(e) => setEmailContent(e.target.value)}
                  ></textarea>
                </div>
                <button onClick={handleSendEmails}>Send Emails</button>
              </Modal>
            </section>
          }
        />
        <Route
          path="/job-application/:reg"
          element={<JobApplicationDetail />}
        />
      </Routes>
    </>
  );
};

export default Dashboard;
