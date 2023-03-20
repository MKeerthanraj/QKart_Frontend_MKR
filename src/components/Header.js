import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import { Avatar, Button, Stack } from "@mui/material";
import Box from "@mui/material/Box";
import React from "react";
import { useHistory } from "react-router-dom";
import "./Header.css";

const Header = ({ userData, children, hasHiddenAuthButtons }) => {
  const history = useHistory();
  return (
    <Box className="header">
      <Box className="header-title">
        <img src="logo_light.svg" alt="QKart-icon"></img>
      </Box>
      {hasHiddenAuthButtons ? (
        <Button
          className="explore-button"
          startIcon={<ArrowBackIcon />}
          variant="text"
          onClick={() => {
            history.push("/");
          }}
        >
          Back to explore
        </Button>
      ) : userData.logged ? (
        <div
          style={{
            display: "flex",
            justifyContent: "end",
            alignItems: "center",
            gap: "10px",
            width: "100%",
          }}
        >
          {children}
          <img src="avatar.png" alt={userData.username} height="40px" />
          <p>{userData.username}</p>
          <Button
            className="logout-button"
            variant="text"
            name="logout"
            onClick={() => {
              localStorage.clear();
              window.location.reload();
            }}
          >
            Logout
          </Button>
        </div>
      ) : (
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            gap: "10px",
            width: "100%",
          }}
        >
          {children}
          <Button
            className="login-button"
            variant="text"
            name="login"
            onClick={() => {
              history.push("/login");
            }}
          >
            Login
          </Button>
          <Button
            className="register-button"
            variant="text"
            name="register"
            onClick={() => {
              history.push("/register");
            }}
          >
            Register
          </Button>
        </div>
      )}
    </Box>
  );
};

export default Header;
