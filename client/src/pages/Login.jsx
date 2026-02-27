import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../api";
import Layout from "../components/Layout";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [err, setErr] = useState("");
  const navigate = useNavigate();

  async function onSubmit(e) {
    e.preventDefault();
    setErr("");
    try {
      const res = await api.post("/auth/login", { email, password });
      localStorage.setItem("token", res.data.token);
      navigate("/");
    } catch (error) {
      setErr(error?.response?.data?.message || "Login failed");
    }
  }

  return (
    <Layout title="Login" subtitle="Sign in to manage your videos">
      <div className="card" style={{ maxWidth: 420, margin: "0 auto" }}>
        <div className="cardBody">
          {err && <div className="alertError">{err}</div>}

          <form onSubmit={onSubmit} style={{ display: "grid", gap: 10 }}>
            <div>
              <label className="muted">Email</label>
              <input
                className="input"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>

            <div>
              <label className="muted">Password</label>
              <input
                className="input"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>

            <button className="btn btnPrimary" type="submit">
              Login
            </button>
          </form>

          <p className="muted" style={{ marginTop: 12 }}>
            No account? <Link to="/register" className="navLink">Register</Link>
          </p>
        </div>
      </div>
    </Layout>
  );
}