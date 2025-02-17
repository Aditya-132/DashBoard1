import React, { useContext, useEffect, useState } from "react";
import { Context } from "../main";
import { Navigate } from "react-router-dom";
import axios from "axios";
import { toast } from "react-toastify";
import Modal from "react-modal";

Modal.setAppElement("#root");

const Docter = () => {
  const yy = "http://localhost:4000";
  const [jobApplications, setJobApplications] = useState([]);
  const [filteredApplications, setFilteredApplications] = useState([]);
  const [filters, setFilters] = useState({
    sick: "",
    leave: "",
  });
  const { isAuthenticated } = useContext(Context);

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
        `${yy}/api/v1/jobApplication/up/${jobApplicationId}`,
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

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters((prevFilters) => ({ ...prevFilters, [name]: value }));
  };

  useEffect(() => {
    const filtered = jobApplications.filter((app) => {
      return Object.entries(filters).every(([key, value]) => {
        if (value === "") return true;
        return app[key] === value;
      });
    });
    setFilteredApplications(filtered);
  }, [filters, jobApplications]);

  if (!isAuthenticated) {
    return <Navigate to={"/login"} />;
  }

  return (
    <div className="min-h-screen bg-gray-100 p-4">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold mb-6">Student Applications Dashboard</h1>
        <div className="bg-white shadow-md rounded-lg p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">Filter Applications</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {Object.entries(filters).map(([key, value]) => (
              <div key={key}>
                <label htmlFor={key} className="block text-sm font-medium text-gray-700 mb-1">
                  {key.charAt(0).toUpperCase() + key.slice(1)}
                </label>
                <select
                  id={key}
                  name={key}
                  value={value}
                  onChange={handleFilterChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">All</option>
                  <option value="Yes">Yes</option>
                  <option value="No">No</option>
                </select>
              </div>
            ))}
          </div>
        </div>
        <div className="bg-white shadow-md rounded-lg overflow-hidden">
          <div className="p-4 border-b border-gray-200">
            <h2 className="text-xl font-semibold">Application List</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Reg Number</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Sick</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Leave</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredApplications.map((app) => (
                  <tr key={app._id}>
                    <td className="px-6 py-4 whitespace-nowrap">{app.fullName}</td>
                    <td className="px-6 py-4 whitespace-nowrap">{app.reg}</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <select
                        value={app.sick}
                        onChange={(e) => handleUpdateStatus(app._id, "sick", e.target.value)}
                        className={`px-2 py-1 rounded ${
                          app.sick === "Yes" ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"
                        }`}
                      >
                        <option value="Yes">Yes</option>
                        <option value="No">No</option>
                      </select>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <select
                        value={app.leave}
                        onChange={(e) => handleUpdateStatus(app._id, "leave", e.target.value)}
                        className={`px-2 py-1 rounded ${
                          app.leave === "Yes" ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"
                        }`}
                      >
                        <option value="Yes">Yes</option>
                        <option value="No">No</option>
                      </select>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Docter;
