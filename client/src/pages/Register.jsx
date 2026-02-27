import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../api";
import Layout from "../components/Layout";

export default function Register() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [err, setErr] = useState("");
  const navigate = useNavigate();

  async function onSubmit(e) {
    e.preventDefault();
    setErr("");

    if (password.length < 6) return setErr("Password must be at least 6 characters.");
    if (password !== confirm) return setErr("Passwords do not match.");

    try {
      const res = await api.post("/auth/register", { email, password });
      localStorage.setItem("token", res.data.token);
      navigate("/");
    } catch (error) {
      setErr(error?.response?.data?.message || "Register failed");
    }
  }

  return (
    <Layout title="Create account" subtitle="Register to upload and annotate videos">
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
                type="email"
                required
              />
            </div>

            <div>
              <label className="muted">Password</label>
              <input
                className="input"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>

            <div>
              <label className="muted">Confirm password</label>
              <input
                className="input"
                type="password"
                value={confirm}
                onChange={(e) => setConfirm(e.target.value)}
                required
              />
            </div>

            <button className="btn btnPrimary" type="submit">
              Create account
            </button>
          </form>

          <p className="muted" style={{ marginTop: 12 }}>
            Already have an account?{" "}
            <Link to="/login" className="navLink">
              Login
            </Link>
          </p>
        </div>
      </div>
    </Layout>
  );
}