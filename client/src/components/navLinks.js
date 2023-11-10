import React from "react";

function NavLinks({ currentPage, handlePageChange }) {
  return (
    <div class="navContainer">
      <ul class="nav nav-tabs">
        <li class="nav-item">
          <a
            href="#home"
            onClick={() => handlePageChange("Home")}
            className={currentPage === "Home" ? "nav-link active" : "nav-link"}
          >
            Home
          </a>
        </li>
        <li class="nav-item">
          <a
            href="#signUp"
            onClick={() => handlePageChange("SignUp")}
            className={
              currentPage === "SignUp" ? "nav-link active" : "nav-link"
            }
          >
            Sign Up
          </a>
        </li>
        <li class="nav-item">
          <a
            href="#login"
            onClick={() => handlePageChange("Login")}
            className={currentPage === "Login" ? "nav-link active" : "nav-link"}
          >
            Login
          </a>
        </li>
        <li class="nav-item">
          <a
            href="#profile"
            onClick={() => handlePageChange("Profile")}
            className={
              currentPage === "Profile" ? "nav-link active" : "nav-link"
            }
          >
            Profile
          </a>
        </li>
        <li class="nav-item">
          <a
            href="#leaderboard"
            onClick={() => handlePageChange("Leaderboard")}
            className={
              currentPage === "Leaderboard" ? "nav-link active" : "nav-link"
            }
          >
            Leaderboard
          </a>
        </li>
      </ul>
    </div>
  );
}

export default NavLinks;
