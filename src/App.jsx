import React, { useContext, useEffect } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Dashboard from "./components/Dashboard";
import Login from "./components/Login";

import { Context } from "./main";
import axios from "axios";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Sidebar from "./components/Sidebar";
import AddNewAdmin from "./components/AddNewAdmin";
import "./App.css";
import JobApplicationDetail from "./components/JobApplicationDetail";
import JobSearch from "./components/JobSearch";
import CompanyDetailsCard from "./components/CompanyDetailsCard";
import EditCompany from "./components/EditCompany";
import Elections from "./components/Elections";


const App = () => {
  const { isAuthenticated, setIsAuthenticated, admin, setAdmin } =
    useContext(Context);
  const yy = "http://localhost:4000";

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const response = await axios.get(`${yy}/api/v1/user/admin/me`, {
          withCredentials: true,
        });
        setIsAuthenticated(true);
        setAdmin(response.data.user);
      } catch (error) {
        console.log(error);
      }
    };
    fetchUser();
  }, [isAuthenticated]);

  return (
    <Router>
      <Sidebar />
      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/login" element={<Login />} />

        <Route path="/admin/addnew" element={<AddNewAdmin />} />
        <Route path="/admin/elections" element={<Elections />} />

        <Route
          path="/job-application/:reg"
          element={<JobApplicationDetail />}
        />
        <Route path="/company-details/:id" element={<CompanyDetailsCard />} />
        <Route path="/edit-company/:id" element={<EditCompany />} />
        <Route path="/admin/jobsearch" element={<JobSearch />} />
      </Routes>

      <ToastContainer position="top-center" />
    </Router>
  );
};

export default App;
