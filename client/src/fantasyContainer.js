import React, { useState } from "react";
import NavLinks from "./components/navLinks";
import Home from "./components/home";
import SignUp from "./components/signUp";
import Login from "./components/login";
import Profile from "./components/profile";
import Leaderboard from "./components/leaderboard";
import Footer from "./components/footer";

export default function FantasyContainer() {
  const [currentPage, setCurrentPage] = useState("Home");

  const renderPage = () => {
    if (currentPage === "Home") {
      return <Home />;
    }
    if (currentPage === "SignUp") {
      return <SignUp />;
    }
    if (currentPage === "Login") {
      return <Login />;
    }
    if (currentPage === "Profile") {
      return <Profile />;
    }
    if (currentPage === "Leaderboard") {
      return <Leaderboard />;
    }
  };

  const handlePageChange = (page) => setCurrentPage(page);
  return (
    <div>
      <NavLinks currentPage={currentPage} handlePageChange={handlePageChange} />
      {renderPage()}
      <Footer />
    </div>
  );
}
