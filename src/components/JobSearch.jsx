// JobSearch.js
import React, { useContext, useEffect, useState } from "react";
import { Context } from "../main";
import { Navigate, Route, Routes } from "react-router-dom";
import axios from "axios";
import { toast } from "react-toastify";
import CompanyCard from "./CompanyCard";
import SearchBar from "./SearchBar";
import "./Dashboard.css";
import { urls } from "../urls";

const JobSearch = () => {
  const yy = "http://localhost:4000"; // Fixed URL by removing extra space

  // State to store company data
  const [companies, setCompanies] = useState([]);
  
  

  // State for job applications and filters (if needed)
  const [jobApplications, setJobApplications] = useState([]);
  const [filteredApplications, setFilteredApplications] = useState([]);
  const [filters, setFilters] = useState({
    cgpa: "",
    hsc: "",
    ssc: "",
    gap_year: "",
    branch: "",
  });

  const { isAuthenticated } = useContext(Context);

  if (!isAuthenticated) {
    return <Navigate to={"/login"} />;
  }

  // Loading state
  const [loading, setLoading] = useState(true);

  // Fetch companies from the API
  useEffect(() => {
    const fetchCompanies = async () => {
      try {
        const response = await axios.get(`${yy}/api/v1/company/all`, {
          withCredentials: true,
        });
        console.log("API Response:", response.data); // For debugging

        // Flexible setter with multiple fallbacks
        const fetchedCompanies =
          response.data.companies ||
          response.data.jobs ||
          response.data.data?.companies ||
          [];

        setCompanies(fetchedCompanies);
      } catch (error) {
        console.error("Error fetching companies:", error);
        setCompanies([]);
        toast.error("Failed to fetch companies.");
      } finally {
        setLoading(false);
      }
    };

    fetchCompanies();
  }, [yy]);

  // Optional: Fetch job applications if needed
  /*
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
  }, [yy]);
  */

  // Optional: Filter logic for job applications
  /*
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
  */

  return (
    <section className="dashboard page ml-10">
      <div className="Company_container mb-3 p-10">
        <h1 className="text-4xl font-bold">Companies</h1>
      </div>
      <SearchBar />
      <div className="pt-8">
        {loading ? (
          <p className="text-center">Loading companies...</p>
        ) : Array.isArray(companies) && companies.length > 0 ? (
          companies.map((company) => (
            <CompanyCard key={company._id} company={company} />
          ))
        ) : (
          <p className="text-center">No companies found.</p>
        )}
      </div>
    </section>
  );
};

export default JobSearch;
