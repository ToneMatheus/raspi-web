import React, { useState } from "react";
import styles from "./LoginPage.module.css";
import { useAuth } from "./AuthContext";
import { useLocation, useNavigate } from "react-router-dom";
import { ExclamationTriangle } from "react-bootstrap-icons";

const Login: React.FC = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const { signIn } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const from = (location.state as any)?.from?.pathname || "/wedding";
  const [error, setError] = useState<string | null>(null);
  const [checked, setChecked] = useState(false);

  const DEMO_USERNAME = process.env.REACT_APP_DEMO_USERNAME || "";
  const DEMO_PASSWORD = process.env.REACT_APP_DEMO_PASSWORD || "";

    const handleCheckedChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const isChecked = e.target.checked;
    setChecked(isChecked);
    if (isChecked) {
      // Auto-fill on check
      setUsername(DEMO_USERNAME);
      setPassword(DEMO_PASSWORD);
    } else {
      // Clear on uncheck (optional; remove if you prefer to keep values)
      setUsername("");
      setPassword("");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    // console.log("Login attempt:", { username, password });
    setError(null);
    try {
      setIsLoading(true);
      await signIn(username, password);
      navigate(from, { replace: true });
    } catch (err: any) {
      setError(err?.message ?? "Login failed");
    }
    finally 
    {
      setIsLoading(false); 
    }
    // TODO: add authentication logic here
  };

  return (
    <div className={styles.loginContainer}>
      <form className={styles.loginBox} onSubmit={handleSubmit}>
        <h2>Login</h2>
        <input
          type="text"
          placeholder="Username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          required
          />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          />
          {error && <div className={styles.error}>{error}</div>}
        <button type="submit">{isLoading ? (
            <>
              <span 
                className="spinner-border spinner-border-sm me-2" 
                role="status" 
                aria-hidden="true"
              ></span>
              Logging in...
            </>
          ) : (
            "Login"
          )}</button>
          <div>
            <input
            type="checkbox"
            checked={checked} 
            onChange={handleCheckedChange}
          />
           <label>Request access to view my portfolio</label>
          </div>
          <div className={styles.error2}> <ExclamationTriangle size={20} style={{ marginRight: "8px" }} />This website is hosted on free assets, which may result in long loading times.</div>
      </form>
    </div>
  );
};

export default Login;
