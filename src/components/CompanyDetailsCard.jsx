// components/CompanyDetailsCard.js

import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { MdCreate, MdDelete } from "react-icons/md";
import axios from "axios";
import { toast } from "react-toastify";

const CompanyDetailsCard = () => {
  const { id } = useParams();
  console.log(id);// Extract the company ID from the URL
  const navigate = useNavigate();
  const [company, setCompany] = useState(null);
  const [loading, setLoading] = useState(true);

  const yy = "https://backend1-96bk.onrender.com"; // Base URL for API

  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    const fetchCompany = async () => {
      try {
        const response = await axios.get(
          `${yy}/api/v1/company/get/${id}`,
          // {
          //   withCredentials: true,
          // }
        );
        setCompany(response.data.company || response.data.job || response.data);
      } catch (error) {
        console.error("Error fetching company details:", error);
        toast.error("Failed to fetch company details.");
      } finally {
        setLoading(false);
      }
    };

    fetchCompany();
  }, [id, yy]);

  if (loading) {
    return <p className="text-center mt-8">Loading company details...</p>;
  }

  if (!company) {
    return (
      <div className="container mx-auto my-8 p-4 bg-red-100 rounded shadow-md text-center">
        <h2 className="text-2xl font-bold text-red-700 mb-4">Error</h2>
        <p className="text-red-600">
          No company data available. Please navigate from the home page.
        </p>
        <button
          onClick={() => navigate("/admin/jobsearch")}
          className="mt-4 bg-blue-500 text-white py-2 px-4 rounded hover:bg-blue-600"
        >
          Go Back Home
        </button>
      </div>
    );
  }

  const {
    jobTitle,
    companyName,
    location: companyLocation,
    createdAt,
    salaryRange,
    duration,
    jobDescription,
    eligibilityCriteria,
    techStacks,
    applicationDeadline,
    status,
    jobRole,
  } = company;

  const postedDate = new Date(createdAt).toLocaleDateString();
  const deadlineDate = new Date(applicationDeadline).toLocaleDateString();

  const handleEditClick = () => {
    navigate(`/edit-company/${id}`);
    // Alternatively, pass state if needed:
    // navigate(`/edit-company/${id}`, { state: { company } });
  };

  const handleDeleteClick = async () => {
    const confirmDelete = window.confirm(
      "Are you sure you want to delete this company/job?"
    );
    if (!confirmDelete) return;

    setIsDeleting(true); // Start deletion process

    try {
      const response = await axios.delete(
        `${yy}/api/v1/company/delete/${id}`,
        {
          withCredentials: true, // Include cookies if needed
        }
      );

      if (response.data.success) {
        toast.success(response.data.message || "Company deleted successfully!");
        // Redirect to the specified route after successful deletion
        navigate("/admin/jobsearch");
      } else {
        toast.error(response.data.message || "Failed to delete the company.");
        setIsDeleting(false); // Reset deletion status
      }
    } catch (error) {
      console.error("Error deleting company:", error);
      const errorMessage =
        error.response?.data?.message || "An error occurred while deleting.";
      toast.error(errorMessage);
      setIsDeleting(false); // Reset deletion status
    }
  };

  const handleEligibleApplicants = () => {
    const { eligibilityCriteria, jobRole } = company;

    const queryParams = new URLSearchParams({
      cgpa: eligibilityCriteria?.minCGPA || "",
      hsc: eligibilityCriteria?.minHSCMarks || "",
      ssc: eligibilityCriteria?.minSSCMarks || "",
      gap_year: eligibilityCriteria?.maxGapYears || "",
      branch: jobRole || "", // Adjust this if branch information is available differently
    }).toString();

    navigate(`/?${queryParams}`);
  };

  return (
    <div className="container mx-auto my-8 p-6 bg-white rounded shadow-lg">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-800">
          {jobTitle || "Job Title Not Specified"}
        </h1>
        <div className="flex space-x-2">
          <button
            onClick={handleEditClick}
            className="flex items-center bg-yellow-500 text-white py-2 px-4 rounded hover:bg-yellow-600"
          >
            <MdCreate className="mr-2" /> Edit
          </button>
          <button
            onClick={handleDeleteClick}
            disabled={isDeleting}
            className={`flex items-center bg-red-500 text-white py-2 px-4 rounded hover:bg-red-600 ${
              isDeleting ? "opacity-50 cursor-not-allowed" : ""
            }`}
          >
            <MdDelete className="mr-2" />{" "}
            {isDeleting ? "Deleting..." : "Delete"}
          </button>
        </div>
      </div>

      <section className="mb-6">
        <h2 className="text-2xl font-semibold text-gray-700 mb-2">
          Job Description
        </h2>
        <p className="text-gray-600">
          {jobDescription || "No job description available."}
        </p>
      </section>

      <section className="mb-6">
        <h2 className="text-2xl font-semibold text-gray-700 mb-2">
          Company Details
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <p>
            <strong>Company Name:</strong> {companyName || "Not specified"}
          </p>
          <p>
            <strong>Job Role:</strong> {jobRole || "Not specified"}
          </p>
          <p>
            <strong>Location:</strong> {companyLocation || "Work from home"}
          </p>
          <p>
            <strong>Salary Range:</strong> ₹{salaryRange || "Not specified"}
          </p>
          <p>
            <strong>Duration:</strong> {duration || "Not specified"}
          </p>
          <p>
            <strong>Status:</strong>{" "}
            <span
              className={`px-2 py-1 rounded ${
                status === "Active"
                  ? "bg-green-200 text-green-800"
                  : "bg-gray-200 text-gray-800"
              }`}
            >
              {status || "Not specified"}
            </span>
          </p>
          <p>
            <strong>Posted On:</strong> {postedDate}
          </p>
          <p>
            <strong>Application Deadline:</strong> {deadlineDate}
          </p>
        </div>
      </section>

      <section className="mb-6">
        <h2 className="text-2xl font-semibold text-gray-700 mb-2">
          Eligibility Criteria
        </h2>
        <ul className="list-disc list-inside text-gray-600">
          <li>Minimum CGPA: {eligibilityCriteria?.minCGPA || "N/A"}</li>
          <li>
            Minimum HSC Marks: {eligibilityCriteria?.minHSCMarks || "N/A"}
          </li>
          <li>
            Minimum SSC Marks: {eligibilityCriteria?.minSSCMarks || "N/A"}
          </li>
          <li>
            Maximum Gap Years: {eligibilityCriteria?.maxGapYears || "N/A"}
          </li>
          <li>Maximum Backlogs: {eligibilityCriteria?.maxBacklogs || "N/A"}</li>
        </ul>
      </section>

      <section className="mb-6">
        <h2 className="text-2xl font-semibold text-gray-700 mb-2">
          Tech Stacks
        </h2>
        <p className="text-gray-600">{techStacks?.join(", ") || "N/A"}</p>
      </section>

      {/* Eligible Applicants Button */}
      <div className="flex justify-end mt-4">
        <button
          onClick={handleEligibleApplicants}
          className="bg-green-500 text-white py-2 px-4 rounded hover:bg-green-600"
        >
          Eligible Applicants
        </button>
      </div>

      <div className="flex justify-end mt-4">
        <button
          onClick={() => navigate(-1)}
          className="bg-blue-500 text-white py-2 px-6 rounded hover:bg-blue-600"
        >
          Back
        </button>
      </div>
    </div>
  );
};

export default CompanyDetailsCard;
