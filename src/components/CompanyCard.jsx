import React from "react";
import { useNavigate } from "react-router-dom"; // Import useNavigate

const CompanyCard = ({ company, onDelete, onEdit }) => {
  const {
    _id, // Ensure that each company has a unique _id
    jobTitle,
    companyName,
    location,
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

  const navigate = useNavigate(); // Initialize navigate

  // Function to handle the 'Explore' button click
  const handleExploreClick = () => {
    navigate(`/company-details/${_id}`); // Navigate to company details page
  };

  return (
    <div className="max-w-sm w-full lg:max-w-full lg:flex my-4">
      <div className="border border-gray-400 bg-white rounded p-4 flex flex-col justify-between leading-normal shadow-md w-full">
        <div className="mb-8">
          <div className="text-gray-900 font-bold text-xl mb-2">
            {jobTitle || "Job Title Not Specified"}
          </div>
          <p className="text-gray-700 text-base">
            {jobDescription || "No description available."}
          </p>
        </div>
        <div className="text-gray-700 text-sm">
          <p>
            <strong>Company:</strong> {companyName || "Not specified"}
          </p>
          <p>
            <strong>Location:</strong> {location || "Work from home"}
          </p>
          <p>
            <strong>Salary:</strong> ₹{salaryRange || "Not specified"}
          </p>
          <p>
            <strong>Posted on:</strong> {postedDate}
          </p>
          <p>
            <strong>Application Deadline:</strong> {deadlineDate}
          </p>
        </div>
        <div className="flex justify-between items-center mt-4">
          <div className="text-gray-600">Posted on: {postedDate}</div>
          {/* Replace hyperlink with a button that uses navigate */}
          <button
            onClick={handleExploreClick}
            className="bg-green-500 text-white font-bold py-2 px-4 rounded hover:bg-green-600"
          >
            Explore
          </button>
        </div>
      </div>
    </div>
  );
};

export default CompanyCard;
