import React from "react";
import LoginForm from "../components/auth/LoginForm";

const LoginPage: React.FC = () => {
  return (
    <main className="auth-page">
      <div className="auth-heading">
        <p className="eyebrow">Welcome back</p>
        <h1>Sign in to your reading list</h1>
        <p>Pick up where you left off and keep your stories close.</p>
      </div>
      <LoginForm />
    </main>
  );
};

export default LoginPage;
