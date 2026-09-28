import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import LandingPage from "./pages/LandingPage";
import LoginPage from "./pages/LoginPage";
import SignupPage from "./pages/SignupPage";
import NewsPage from "./pages/NewsPage";
import Navbar from "./components/layout/Navbar";
import Footer from "./components/layout/Footer";
import { AuthProvider } from "./auth/AuthContext";
import { GuestOnly, RequireAuth } from "./auth/RouteGuards";

const App = () => {
  return (
    <Router>
      <AuthProvider>
        <Navbar />
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route
            path="/login"
            element={
              <GuestOnly>
                <LoginPage />
              </GuestOnly>
            }
          />
          <Route
            path="/signup"
            element={
              <GuestOnly>
                <SignupPage />
              </GuestOnly>
            }
          />
          <Route
            path="/news"
            element={
              <RequireAuth>
                <NewsPage />
              </RequireAuth>
            }
          />
        </Routes>
        <Footer />
      </AuthProvider>
    </Router>
  );
};

export default App;
