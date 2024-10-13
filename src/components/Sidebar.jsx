import React, { useContext, useState } from "react";
import { TiHome } from "react-icons/ti";
import { RiLogoutBoxFill } from "react-icons/ri";
import { AiFillMessage } from "react-icons/ai";
import { GiHamburgerMenu } from "react-icons/gi";
import { FaPersonChalkboard } from "react-icons/fa6";
import { MdAddModerator } from "react-icons/md";
import { IoPersonAddSharp } from "react-icons/io5";
import axios from "axios";
import { toast } from "react-toastify";
import { Context } from "../main";
import { useNavigate } from "react-router-dom";
import './Sidebar.css';

const Sidebar = () => {
  const [show, setShow] = useState(false);
  const [selectedIcon, setSelectedIcon] = useState(null); // To track the selected icon

  const { isAuthenticated, setIsAuthenticated } = useContext(Context);
  const yy = "https://backend1-96bk.onrender.com";

  const handleLogout = async () => {
    await axios
      .get(`${yy}/api/v1/user/admin/logout`, {
        withCredentials: true,
      })
      .then((res) => {
        toast.success(res.data.message);
        setIsAuthenticated(false);
      })
      .catch((err) => {
        toast.error(err.response.data.message);
      });
  };

  const navigateTo = useNavigate();

  const gotoHomePage = () => {
    navigateTo("/");
    setShow(!show);
    setSelectedIcon('home'); // Set the selected icon
  };

  const gotoAddNewAdmin = () => {
    navigateTo("/admin/addnew");
    setShow(!show);
    setSelectedIcon('addAdmin'); // Set the selected icon
  };

  const gotoJobSearch = () => {
    navigateTo("/admin/jobsearch");
    setShow(!show);
    setSelectedIcon('jobSearch'); // Set the selected icon
  };

  const handleLogoutClick = () => {
    handleLogout();
    setSelectedIcon('logout'); // Set the selected icon
  };

  return (
    <>
      <nav
        style={!isAuthenticated ? { display: "none" } : { display: "flex" }}
        className={show ? "show sidebar" : "sidebar"}
      >
        <div className="links">
          <TiHome 
            onClick={gotoHomePage}
            style={{
              backgroundColor: selectedIcon === 'home' ? 'white' : 'transparent',
              color: selectedIcon === 'home' ? '#03346E' : 'inherit',
              borderRadius: '8px',
              cursor: 'pointer',
              transition: '0.3s'
            }}
          />
          <MdAddModerator 
            onClick={gotoAddNewAdmin}
            style={{
              backgroundColor: selectedIcon === 'addAdmin' ? 'white' : 'transparent',
              color: selectedIcon === 'addAdmin' ? '#03346E' : 'inherit',
              borderRadius: '8px',
              cursor: 'pointer',
              transition: '0.3s'
            }}
          />
          <FaPersonChalkboard 
            onClick={gotoJobSearch}
            style={{
              backgroundColor: selectedIcon === 'jobSearch' ? 'white' : 'transparent',
              color: selectedIcon === 'jobSearch' ? '#03346E' : 'inherit',
              borderRadius: '8px',
              cursor: 'pointer',
              transition: '0.3s'
            }}
          />
          <RiLogoutBoxFill 
            onClick={handleLogoutClick}
            style={{
              backgroundColor: selectedIcon === 'logout' ? 'white' : 'transparent',
              color: selectedIcon === 'logout' ? '#03346E' : 'inherit',
              borderRadius: '8px',
              cursor: 'pointer',
              transition: '0.3s'
            }}
          />
        </div>
      </nav>
      <div
        className="wrapper"
        style={!isAuthenticated ? { display: "none" } : { display: "flex" }}
      >
        <GiHamburgerMenu className="hamburger" onClick={() => setShow(!show)} />
      </div>
    </>
  );
};

export default Sidebar;
