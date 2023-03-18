import { Button, CircularProgress, Stack, TextField } from "@mui/material";
import { Box } from "@mui/system";
import axios from "axios";
import { useSnackbar } from "notistack";
import React, { useState } from "react";
import { useHistory, Link } from "react-router-dom";
import { config } from "../App";
import Footer from "./Footer";
import Header from "./Header";
import "./Login.css";

const Login = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const { enqueueSnackbar } = useSnackbar();

  const history = useHistory();

  /**
   * Perform the Login API call
   * @param {{ username: string, password: string }} formData
   *  Object with values of username, password and confirm password user entered to register
   *
   * API endpoint - "POST /auth/login"
   *
   * Example for successful response from backend:
   * HTTP 201
   * {
   *      "success": true,
   *      "token": "testtoken",
   *      "username": "criodo",
   *      "balance": 5000
   * }
   *
   * Example for failed response from backend:
   * HTTP 400
   * {
   *      "success": false,
   *      "message": "Password is incorrect"
   * }
   *
   */
  const login = async (formData) => {
    if (validateInput(formData)) {
      setLoading(true);
      let url = config.endpoint + "/auth/login";
      const headers = {
        "Content-type": "application/json; charset=utf-8",
      };
      await axios
        .post(url, formData, headers)
        .then((response) => {
          persistLogin(
            response.data.token,
            response.data.username,
            response.data.balance
          );
          setLoading(false);
          enqueueSnackbar("Logged in successfully", {
            variant: "success",
            autoHideDuration: 3000,
          });
          history.push("/");
        })
        .catch((error) => {
          setLoading(false);
          if (error.toJSON().message == "Network Error") {
            enqueueSnackbar(
              "Something went wrong. Check that the backend is running, reachable and returns valid JSON.",
              { variant: "error", autoHideDuration: 3000 }
            );
          } else {
            enqueueSnackbar(error.response.data.message, {
              variant: "error",
              autoHideDuration: 3000,
            });
          }
        });
    }
  };

  /**
   * Validate the input values so that any bad or illegal values are not passed to the backend.
   *
   * @param {{ username: string, password: string }} data
   *  Object with values of username, password and confirm password user entered to register
   *
   * @returns {boolean}
   *    Whether validation has passed or not
   *
   * Return false and show warning message if any validation condition fails, otherwise return true.
   * (NOTE: The error messages to be shown for each of these cases, are given with them)
   * -    Check that username field is not an empty value - "Username is a required field"
   * -    Check that password field is not an empty value - "Password is a required field"
   */
  const validateInput = (data) => {
    if (data.username.length === 0) {
      enqueueSnackbar("Username is required!", {
        variant: "warning",
        autoHideDuration: 3000,
      });
      return false;
    } else if (data.password.length === 0) {
      enqueueSnackbar("Password is required!", {
        variant: "warning",
        autoHideDuration: 3000,
      });
      return false;
    }
    return true;
  };

  /**
   * Store the login information so that it can be used to identify the user in subsequent API calls
   *
   * @param {string} token
   *    API token used for authentication of requests after logging in
   * @param {string} username
   *    Username of the logged in user
   * @param {string} balance
   *    Wallet balance amount of the logged in user
   *
   * Make use of localStorage: https://developer.mozilla.org/en-US/docs/Web/API/Window/localStorage
   * -    `token` field in localStorage can be used to store the Oauth token
   * -    `username` field in localStorage can be used to store the username that the user is logged in as
   * -    `balance` field in localStorage can be used to store the balance amount in the user's wallet
   */
  const persistLogin = (token, username, balance) => {
    localStorage.setItem("username", username);
    localStorage.setItem("token", token);
    localStorage.setItem("balance", balance);
  };

  return (
    <Box
      display="flex"
      flexDirection="column"
      justifyContent="space-between"
      minHeight="100vh"
    >
      <Header hasHiddenAuthButtons={true} />
      <Box className="content">
        <Stack spacing={2} className="form">
          <h2 className="title">Login</h2>
          <TextField
            id="username"
            label="Username"
            variant="outlined"
            placeholder="Enter Username"
            fullWidth
            required
            onChange={(event) => {
              setUsername(event.target.value);
            }}
          />

          <TextField
            id="password"
            label="Password"
            variant="outlined"
            placeholder="Password must be atleast 6 characters length"
            type="password"
            helperText="Password must be atleast 6 characters length"
            fullWidth
            required
            onChange={(event) => {
              setPassword(event.target.value);
            }}
          />

          {loading ? (
            <CircularProgress style={{ margin: "10px auto" }} />
          ) : (
            <Button
              className="button"
              variant="contained"
              onClick={() => {
                login({ username: username, password: password });
              }}
            >
              LOGIN TO QKART
            </Button>
          )}

          <p className="secondary-action">
            Don't have an account?{" "}
            <Link className="link" to="/register">
              Register now
            </Link>
          </p>
        </Stack>
      </Box>
      <Footer />
    </Box>
  );
};

export default Login;
