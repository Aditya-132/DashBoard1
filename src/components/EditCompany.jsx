import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import { toast } from "react-toastify";

const EditCompany = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const yy = "http://localhost:4000";

  const [formData, setFormData] = useState({
    jobTitle: "",
    jobDescription: "",
    companyName: "",
    location: "",
    applicationDeadline: "",
    eligibilityCriteria: {
      minCGPA: "",
      minHSCMarks: "",
      minSSCMarks: "",
      maxGapYears: "",
      maxBacklogs: "",
    },
    techStacks: "",
  });

  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const fetchJobDetails = async () => {
      try {
        const response = await axios.get(
          `${yy}/api/v1/company/get/${id}`,
          {
            withCredentials: true,
          }
        );
        const companyData =
          response.data.company || response.data.job || response.data;

        setFormData({
          jobTitle: companyData.jobTitle || "",
          jobDescription: companyData.jobDescription || "",
          companyName: companyData.companyName || "",
          location: companyData.location || "",
          applicationDeadline: companyData.applicationDeadline
            ? new Date(companyData.applicationDeadline)
                .toISOString()
                .split("T")[0]
            : "",
          eligibilityCriteria: {
            minCGPA: companyData.eligibilityCriteria?.minCGPA || "",
            minHSCMarks: companyData.eligibilityCriteria?.minHSCMarks || "",
            minSSCMarks: companyData.eligibilityCriteria?.minSSCMarks || "",
            maxGapYears: companyData.eligibilityCriteria?.maxGapYears || "",
            maxBacklogs: companyData.eligibilityCriteria?.maxBacklogs || "",
          },
          techStacks: companyData.techStacks
            ? companyData.techStacks.join(", ")
            : "",
        });
      } catch (error) {
        console.error("Error fetching job details:", error);
        toast.error("Failed to fetch job details.");
        navigate("/admin/jobsearch");
      } finally {
        setLoading(false);
      }
    };

    fetchJobDetails();
  }, [id, yy, navigate]);

  const handleChange = (e) => {
    const { name, value } = e.target;

    // Handle nested eligibilityCriteria
    if (name.startsWith("eligibilityCriteria.")) {
      const key = name.split(".")[1];
      setFormData((prevData) => ({
        ...prevData,
        eligibilityCriteria: {
          ...prevData.eligibilityCriteria,
          [key]: value,
        },
      }));
    } else {
      setFormData((prevData) => ({
        ...prevData,
        [name]: value,
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    // Prepare techStacks as an array
    const techStacksArray = formData.techStacks
      .split(",")
      .map((tech) => tech.trim())
      .filter((tech) => tech);

    // Prepare the payload
    const payload = {
      jobTitle: formData.jobTitle,
      jobDescription: formData.jobDescription,
      companyName: formData.companyName,
      location: formData.location,
      applicationDeadline: formData.applicationDeadline,
      eligibilityCriteria: {
        minCGPA: Number(formData.eligibilityCriteria.minCGPA),
        minHSCMarks: Number(formData.eligibilityCriteria.minHSCMarks),
        minSSCMarks: Number(formData.eligibilityCriteria.minSSCMarks),
        maxGapYears: Number(formData.eligibilityCriteria.maxGapYears),
        maxBacklogs: Number(formData.eligibilityCriteria.maxBacklogs),
      },
      techStacks: techStacksArray,
    };

    try {
      const response = await axios.put(
        `${yy}/api/v1/company/update/${id}`,
        payload,
        {
          withCredentials: true,
        }
      );

      if (response.data.success) {
        toast.success(response.data.message || "Job updated successfully!");
        navigate(`/company-details/${id}`);
      } else {
        toast.error(response.data.message || "Failed to update the job.");
      }
    } catch (error) {
      console.error("Error updating job:", error);
      const errorMessage =
        error.response?.data?.message ||
        "An error occurred while updating the job.";
      toast.error(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return <p className="text-center mt-8">Loading job details...</p>;
  }

  return (
    <div className="container mx-auto my-8 p-6 bg-white rounded shadow-lg">
      <h1 className="text-3xl font-bold text-gray-800 mb-6">Edit Job</h1>
      <form onSubmit={handleSubmit}>
        {/* Job Title */}
        <div className="mb-4">
          <label className="block text-gray-700">Job Title</label>
          <input
            type="text"
            name="jobTitle"
            value={formData.jobTitle}
            onChange={handleChange}
            required
            className="w-full mt-1 p-2 border rounded"
          />
        </div>

        {/* Job Description */}
        <div className="mb-4">
          <label className="block text-gray-700">Job Description</label>
          <textarea
            name="jobDescription"
            value={formData.jobDescription}
            onChange={handleChange}
            required
            className="w-full mt-1 p-2 border rounded"
            rows="4"
          ></textarea>
        </div>

        {/* Company Name */}
        <div className="mb-4">
          <label className="block text-gray-700">Company Name</label>
          <input
            type="text"
            name="companyName"
            value={formData.companyName}
            onChange={handleChange}
            required
            className="w-full mt-1 p-2 border rounded"
          />
        </div>

        {/* Location */}
        <div className="mb-4">
          <label className="block text-gray-700">Location</label>
          <input
            type="text"
            name="location"
            value={formData.location}
            onChange={handleChange}
            className="w-full mt-1 p-2 border rounded"
          />
        </div>

        {/* Application Deadline */}
        <div className="mb-4">
          <label className="block text-gray-700">Application Deadline</label>
          <input
            type="date"
            name="applicationDeadline"
            value={formData.applicationDeadline}
            onChange={handleChange}
            required
            className="w-full mt-1 p-2 border rounded"
          />
        </div>

        {/* Eligibility Criteria */}
        <div className="mb-4">
          <h2 className="text-xl font-semibold text-gray-700 mb-2">
            Eligibility Criteria
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Minimum CGPA */}
            <div>
              <label className="block text-gray-700">Minimum CGPA</label>
              <input
                type="number"
                step="0.01"
                name="eligibilityCriteria.minCGPA"
                value={formData.eligibilityCriteria.minCGPA}
                onChange={handleChange}
                required
                min="0"
                max="10"
                className="w-full mt-1 p-2 border rounded"
              />
            </div>

            {/* Minimum HSC Marks */}
            <div>
              <label className="block text-gray-700">Minimum HSC Marks</label>
              <input
                type="number"
                name="eligibilityCriteria.minHSCMarks"
                value={formData.eligibilityCriteria.minHSCMarks}
                onChange={handleChange}
                required
                min="0"
                max="100"
                className="w-full mt-1 p-2 border rounded"
              />
            </div>

            {/* Minimum SSC Marks */}
            <div>
              <label className="block text-gray-700">Minimum SSC Marks</label>
              <input
                type="number"
                name="eligibilityCriteria.minSSCMarks"
                value={formData.eligibilityCriteria.minSSCMarks}
                onChange={handleChange}
                required
                min="0"
                max="100"
                className="w-full mt-1 p-2 border rounded"
              />
            </div>

            {/* Maximum Gap Years */}
            <div>
              <label className="block text-gray-700">Maximum Gap Years</label>
              <input
                type="number"
                name="eligibilityCriteria.maxGapYears"
                value={formData.eligibilityCriteria.maxGapYears}
                onChange={handleChange}
                required
                min="0"
                className="w-full mt-1 p-2 border rounded"
              />
            </div>

            {/* Maximum Backlogs */}
            <div>
              <label className="block text-gray-700">Maximum Backlogs</label>
              <input
                type="number"
                name="eligibilityCriteria.maxBacklogs"
                value={formData.eligibilityCriteria.maxBacklogs}
                onChange={handleChange}
                required
                min="0"
                className="w-full mt-1 p-2 border rounded"
              />
            </div>
          </div>
        </div>

        {/* Tech Stacks */}
        <div className="mb-4">
          <label className="block text-gray-700">
            Tech Stacks (comma separated)
          </label>
          <input
            type="text"
            name="techStacks"
            value={formData.techStacks}
            onChange={handleChange}
            required
            className="w-full mt-1 p-2 border rounded"
            placeholder="e.g., JavaScript, React, Node.js"
          />
        </div>

        {/* Submit Button */}
        <div className="flex justify-end">
          <button
            type="submit"
            disabled={isSubmitting}
            className={`bg-green-500 text-white py-2 px-6 rounded hover:bg-green-600 ${
              isSubmitting ? "opacity-50 cursor-not-allowed" : ""
            }`}
          >
            {isSubmitting ? "Updating..." : "Update Job"}
          </button>
        </div>
      </form>
    </div>
  );
};

export default EditCompany;
