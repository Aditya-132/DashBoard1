import React, { useContext, useEffect, useState } from "react";
import { Context } from "../main";
import { Navigate, Link, Route, Routes, useLocation } from "react-router-dom";
import axios from "axios";
import { toast } from "react-toastify";
import { FaEye, FaDownload, FaEnvelope, FaFilter } from "react-icons/fa";
import Modal from "react-modal";
import JobApplicationDetail from "./JobApplicationDetail";
import Papa from "papaparse";

Modal.setAppElement("#root");

const Dashboard = () => {
  const yy = "https://backend1-96bk.onrender.com";
  const [jobApplications, setJobApplications] = useState([]);
  const [filteredApplications, setFilteredApplications] = useState([]);
  const [modalIsOpen, setModalIsOpen] = useState(false);
  const [proofUrl, setProofUrl] = useState("");
  const [filters, setFilters] = useState({
    fullName: "",
    reg: "",
    cgpa: "",
    hsc: "",
    ssc: "",
    branch: "",
    status: "",
    placed: "",
    amount: "",
  });
  const [emailModalIsOpen, setEmailModalIsOpen] = useState(false);
  const [emailSubject, setEmailSubject] = useState("");
  const [emailContent, setEmailContent] = useState("");
  const [sortConfig, setSortConfig] = useState({ key: null, direction: 'ascending' });

  const location = useLocation();
  const { isAuthenticated } = useContext(Context);

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const newFilters = {};
    Object.keys(filters).forEach(key => {
      newFilters[key] = params.get(key) || "";
    });
    setFilters(newFilters);
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
      const updatedApplications = jobApplications.map((app) =>
        app._id === jobApplicationId ? { ...app, [field]: value } : app
      );
      setJobApplications(updatedApplications);
      setFilteredApplications(updatedApplications);
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

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters((prevFilters) => ({ ...prevFilters, [name]: value }));
  };

  useEffect(() => {
    const filtered = jobApplications.filter((app) => {
      return Object.entries(filters).every(([key, value]) => {
        if (value === "") return true;
        if (["cgpa", "hsc", "ssc", "amount"].includes(key)) {
          return app[key] >= parseFloat(value);
        }
        if (key === "fullName" || key === "reg" || key === "branch") {
          return app[key].toLowerCase().includes(value.toLowerCase());
        }
        return app[key] === value;
      });
    });
    setFilteredApplications(filtered);
  }, [filters, jobApplications]);

  const handleDownloadCSV = () => {
    const csvData = filteredApplications.map((app) => ({
      "Full Name": app.fullName,
      "Registration Number": app.reg,
      CGPA: app.cgpa,
      "HSC Marks": app.hsc,
      "SSC Marks": app.ssc,
      Department: app.branch,
      Status: app.status,
      Placed: app.placed,
      Package: app.amount,
      Email: app.email,
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
    const emailAddresses = filteredApplications.map((app) => app.email);
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

  const handleSort = (key) => {
    let direction = 'ascending';
    if (sortConfig.key === key && sortConfig.direction === 'ascending') {
      direction = 'descending';
    }
    setSortConfig({ key, direction });
  };

  const sortedApplications = React.useMemo(() => {
    let sortableItems = [...filteredApplications];
    if (sortConfig.key !== null) {
      sortableItems.sort((a, b) => {
        if (a[sortConfig.key] < b[sortConfig.key]) {
          return sortConfig.direction === 'ascending' ? -1 : 1;
        }
        if (a[sortConfig.key] > b[sortConfig.key]) {
          return sortConfig.direction === 'ascending' ? 1 : -1;
        }
        return 0;
      });
    }
    return sortableItems;
  }, [filteredApplications, sortConfig]);

  if (!isAuthenticated) {
    return <Navigate to={"/login"} />;
  }

  return (
    <div className="min-h-screen bg-gray-100 p-4">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold mb-6">Student Applications Dashboard</h1>
        <div className="bg-white shadow-md rounded-lg p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">Filter Applications</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {Object.entries(filters).map(([key, value]) => (
              <div key={key}>
                <label htmlFor={key} className="block text-sm font-medium text-gray-700 mb-1">
                  {key.charAt(0).toUpperCase() + key.slice(1)}
                </label>
                <input
                  type={["cgpa", "hsc", "ssc", "amount"].includes(key) ? "number" : "text"}
                  id={key}
                  name={key}
                  value={value}
                  onChange={handleFilterChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder={`Filter by ${key}`}
                />
              </div>
            ))}
          </div>
        </div>
        <div className="bg-white shadow-md rounded-lg overflow-hidden">
          <div className="p-4 border-b border-gray-200 flex justify-between items-center">
            <h2 className="text-xl font-semibold">Application List</h2>
            <div className="space-x-2">
              <button
                onClick={handleDownloadCSV}
                className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 transition duration-200"
              >
                <FaDownload className="inline-block mr-2" />
                Download CSV
              </button>
              <button
                onClick={() => setEmailModalIsOpen(true)}
                className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition duration-200"
              >
                <FaEnvelope className="inline-block mr-2" />
                Send Emails
              </button>
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  {Object.keys(filters).map((key) => (
                    <th
                      key={key}
                      scope="col"
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                      onClick={() => handleSort(key)}
                    >
                      {key.charAt(0).toUpperCase() + key.slice(1)}
                      {sortConfig.key === key && (
                        <span>{sortConfig.direction === 'ascending' ? ' ▲' : ' ▼'}</span>
                      )}
                    </th>
                  ))}
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {sortedApplications.map((app) => (
                  <tr key={app._id}>
                    {Object.entries(filters).map(([key, _]) => (
                      <td key={key} className="px-6 py-4 whitespace-nowrap">
                        {key === "reg" ? (
                          <Link to={`/job-application/${app.reg}`} className="text-blue-600 hover:underline">
                            {app[key]}
                          </Link>
                        ) : key === "status" || key === "placed" ? (
                          <select
                            value={app[key]}
                            onChange={(e) => handleUpdateStatus(app._id, key, e.target.value)}
                            className={`px-2 py-1 rounded ${
                              app[key] === "Pending" ? "bg-yellow-100 text-yellow-800" :
                              app[key] === "Accepted" || app[key] === "Placed" ? "bg-green-100 text-green-800" :
                              "bg-red-100 text-red-800"
                            }`}
                          >
                            {key === "status" ? (
                              <>
                                <option value="Pending">Pending</option>
                                <option value="Accepted">Accepted</option>
                                <option value="Rejected">Rejected</option>
                              </>
                            ) : (
                              <>
                                <option value="Not Placed">Not Placed</option>
                                <option value="Placed">Placed</option>
                              </>
                            )}
                          </select>
                        ) : key === "amount" ? (
                          <input
                            type="number"
                            value={app[key] || ""}
                            onChange={(e) => handleUpdateStatus(app._id, key, e.target.value)}
                            className="w-full px-2 py-1 border rounded"
                            placeholder="Package"
                          />
                        ) : (
                          app[key]
                        )}
                      </td>
                    ))}
                    <td className="px-6 py-4 whitespace-nowrap">
                      <button
                        onClick={() => openModal(app.proof.url)}
                        className="text-blue-600 hover:text-blue-900"
                      >
                        <FaEye className="inline-block mr-1" /> View Proof
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
      <Modal
        isOpen={modalIsOpen}
        onRequestClose={closeModal}
        contentLabel="Proof Modal"
        className="modal max-w-2xl mx-auto mt-20 bg-white p-6 rounded-lg shadow-xl"
        overlayClassName="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center"
      >
        <button onClick={closeModal} className="absolute top-2 right-2 text-gray-600 hover:text-gray-800">
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
        {proofUrl && <img src={proofUrl} alt="Proof" className="max-w-full h-auto" />}
      </Modal>
      <Modal
        isOpen={emailModalIsOpen}
        onRequestClose={() => setEmailModalIsOpen(false)}
        contentLabel="Email Modal"
        className="modal max-w-2xl mx-auto mt-20 bg-white p-6 rounded-lg shadow-xl"
        overlayClassName="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center"
      >
        <h2 className="text-2xl font-bold mb-4">Compose Email</h2>
        <div className="mb-4">
          <label htmlFor="emailSubject" className="block text-sm font-medium text-gray-700 mb-1">Email Subject</label>
          <input
            id="emailSubject"
            type="text"
            value={emailSubject}
            onChange={(e) => setEmailSubject(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <div className="mb-4">
          <label  htmlFor="emailContent" className="block text-sm font-medium text-gray-700 mb-1">Email Content</label>
          <textarea
            id="emailContent"
            value={emailContent}
            onChange={(e) => setEmailContent(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            rows="6"
          ></textarea>
        </div>
        <div className="mb-4">
          <h3 className="text-lg font-semibold mb-2">Recipients:</h3>
          <div className="max-h-40 overflow-y-auto border border-gray-300 rounded-md p-2">
            {filteredApplications.map((app) => (
              <div key={app._id} className="mb-1">
                {app.fullName} ({app.email})
              </div>
            ))}
          </div>
        </div>
        <div className="flex justify-end space-x-2">
          <button
            onClick={() => setEmailModalIsOpen(false)}
            className="px-4 py-2 bg-gray-200 text-gray-800 rounded hover:bg-gray-300 transition duration-200"
          >
            Cancel
          </button>
          <button
            onClick={handleSendEmails}
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition duration-200"
          >
            Send Emails
          </button>
        </div>
      </Modal>
    </div>
  );
};

export default Dashboard;