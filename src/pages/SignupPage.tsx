import React from "react";
import SignupForm from "../components/auth/SignupForm";

const SignupPage: React.FC = () => {
  return (
    <main className="auth-page">
      <div className="auth-heading">
        <p className="eyebrow">Make it yours</p>
        <h1>A better way to keep up</h1>
        <p>Create an account to save stories for later.</p>
      </div>
      <SignupForm />
    </main>
  );
};

export default SignupPage;
