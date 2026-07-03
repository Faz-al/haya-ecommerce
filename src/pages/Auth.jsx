import { useState } from "react";
import {
  Eye,
  EyeOff,
  LockKeyhole,
  Mail,
  UserRound,
} from "lucide-react";
import {
  Link,
  Navigate,
  useLocation,
  useNavigate,
} from "react-router-dom";

import AnnouncementBar from "../components/home/AnnouncementBar";
import Navbar from "../components/layouts/Navbar";
import Footer from "../components/home/Footer";

import { useAuth } from "../context/AuthContext";

export default function Auth() {
  const navigate = useNavigate();
  const location = useLocation();

  const {
    user,
    authLoading,
    signUp,
    signIn,
  } = useAuth();

  const [mode, setMode] = useState("login");
  const [showPassword, setShowPassword] =
    useState(false);
  const [submitting, setSubmitting] =
    useState(false);
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] =
    useState("error");

  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
  });

  const destination =
    location.state?.from?.pathname || "/account";

  const handleChange = (event) => {
    const { name, value } = event.target;

    setFormData((current) => ({
      ...current,
      [name]: value,
    }));

    setMessage("");
  };

  const changeMode = (newMode) => {
    setMode(newMode);
    setMessage("");
    setShowPassword(false);

    setFormData({
      firstName: "",
      lastName: "",
      email: "",
      password: "",
    });
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setMessage("");

    if (
      !formData.email.trim() ||
      !formData.password.trim()
    ) {
      setMessageType("error");
      setMessage(
        "Please enter your email address and password."
      );
      return;
    }

    if (
      mode === "register" &&
      (!formData.firstName.trim() ||
        !formData.lastName.trim())
    ) {
      setMessageType("error");
      setMessage(
        "Please enter your first and last name."
      );
      return;
    }

    if (formData.password.length < 6) {
      setMessageType("error");
      setMessage(
        "Your password must contain at least 6 characters."
      );
      return;
    }

    setSubmitting(true);

    try {
      if (mode === "register") {
        const { data, error } = await signUp({
          firstName: formData.firstName,
          lastName: formData.lastName,
          email: formData.email,
          password: formData.password,
        });

        if (error) {
          setMessageType("error");
          setMessage(error.message);
          return;
        }

        if (data.session) {
          navigate(destination, {
            replace: true,
          });
          return;
        }

        setMessageType("success");
        setMessage(
          "Account created. Check your email and click the confirmation link before logging in."
        );

        setMode("login");

        setFormData((current) => ({
          firstName: "",
          lastName: "",
          email: current.email,
          password: "",
        }));

        return;
      }

      const { error } = await signIn({
        email: formData.email,
        password: formData.password,
      });

      if (error) {
        setMessageType("error");
        setMessage(error.message);
        return;
      }

      navigate(destination, {
        replace: true,
      });
    } catch (error) {
      console.error("Authentication error:", error);

      setMessageType("error");
      setMessage(
        "Something went wrong. Please try again."
      );
    } finally {
      setSubmitting(false);
    }
  };

  if (authLoading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#f5f1ec] text-[#211c18]">
        <p className="text-[9px] uppercase tracking-[0.22em]">
          Loading account
        </p>
      </main>
    );
  }

  if (user) {
    return (
      <Navigate
        to="/account"
        replace
      />
    );
  }

  return (
    <main className="min-h-screen bg-[#f5f1ec] text-[#211c18]">
      <AnnouncementBar />
      <Navbar />

      <section className="mx-auto grid min-h-screen max-w-[1450px] items-center px-4 pb-20 pt-[140px] sm:px-7 sm:pt-[155px] lg:grid-cols-[0.9fr_1.1fr] lg:gap-20 lg:px-12 lg:pt-[175px]">
        <div className="hidden lg:block">
          <p className="text-[8px] uppercase tracking-[0.3em] text-[#7c7169]">
            The Haya Account
          </p>

          <h1 className="mt-5 max-w-[570px] font-serif text-[64px] leading-[0.95] tracking-[-0.045em]">
            Your wardrobe,
            <br />
            thoughtfully saved.
          </h1>

          <p className="mt-7 max-w-[470px] text-[12px] leading-7 text-[#746960]">
            Sign in to view your orders, manage your account
            and continue building your Haya collection.
          </p>

          <div className="mt-10 space-y-5 border-t border-black/10 pt-8">
            <div className="flex items-center gap-4">
              <UserRound
                size={17}
                strokeWidth={1.3}
              />

              <span className="text-[9px] uppercase tracking-[0.17em]">
                Personal customer account
              </span>
            </div>

            <div className="flex items-center gap-4">
              <LockKeyhole
                size={17}
                strokeWidth={1.3}
              />

              <span className="text-[9px] uppercase tracking-[0.17em]">
                Secure Supabase authentication
              </span>
            </div>

            <div className="flex items-center gap-4">
              <Mail
                size={17}
                strokeWidth={1.3}
              />

              <span className="text-[9px] uppercase tracking-[0.17em]">
                Email verification
              </span>
            </div>
          </div>
        </div>

        <div className="mx-auto w-full max-w-[560px] border border-black/10 bg-[#eee7df] p-6 sm:p-10 lg:p-12">
          <div className="grid grid-cols-2 border border-black/10">
            <button
              type="button"
              onClick={() => changeMode("login")}
              className={`min-h-12 text-[8px] uppercase tracking-[0.2em] transition ${
                mode === "login"
                  ? "bg-[#211c18] text-white"
                  : "hover:bg-white/60"
              }`}
            >
              Sign In
            </button>

            <button
              type="button"
              onClick={() => changeMode("register")}
              className={`min-h-12 text-[8px] uppercase tracking-[0.2em] transition ${
                mode === "register"
                  ? "bg-[#211c18] text-white"
                  : "hover:bg-white/60"
              }`}
            >
              Create Account
            </button>
          </div>

          <div className="mt-9">
            <p className="text-[8px] uppercase tracking-[0.27em] text-[#786d65]">
              {mode === "login"
                ? "Welcome Back"
                : "Join Haya"}
            </p>

            <h2 className="mt-3 font-serif text-[36px] leading-none tracking-[-0.035em] sm:text-[43px]">
              {mode === "login"
                ? "Sign in"
                : "Create your account"}
            </h2>

            <p className="mt-4 text-[10px] leading-6 text-[#756a62]">
              {mode === "login"
                ? "Enter the email and password connected to your Haya account."
                : "Create an account to access your orders and customer profile."}
            </p>
          </div>

          <form
            onSubmit={handleSubmit}
            className="mt-8"
          >
            {mode === "register" && (
              <div className="grid gap-5 sm:grid-cols-2">
                <div>
                  <label
                    htmlFor="firstName"
                    className="block text-[8px] uppercase tracking-[0.17em]"
                  >
                    First Name
                  </label>

                  <input
                    id="firstName"
                    type="text"
                    name="firstName"
                    autoComplete="given-name"
                    value={formData.firstName}
                    onChange={handleChange}
                    className="mt-3 h-13 w-full border border-black/15 bg-transparent px-4 text-[11px] outline-none transition focus:border-black/50"
                  />
                </div>

                <div>
                  <label
                    htmlFor="lastName"
                    className="block text-[8px] uppercase tracking-[0.17em]"
                  >
                    Last Name
                  </label>

                  <input
                    id="lastName"
                    type="text"
                    name="lastName"
                    autoComplete="family-name"
                    value={formData.lastName}
                    onChange={handleChange}
                    className="mt-3 h-13 w-full border border-black/15 bg-transparent px-4 text-[11px] outline-none transition focus:border-black/50"
                  />
                </div>
              </div>
            )}

            <div
              className={
                mode === "register" ? "mt-5" : ""
              }
            >
              <label
                htmlFor="email"
                className="block text-[8px] uppercase tracking-[0.17em]"
              >
                Email Address
              </label>

              <input
                required
                id="email"
                type="email"
                name="email"
                autoComplete="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="you@example.com"
                className="mt-3 h-13 w-full border border-black/15 bg-transparent px-4 text-[11px] outline-none transition placeholder:text-[#9b9189] focus:border-black/50"
              />
            </div>

            <div className="mt-5">
              <label
                htmlFor="password"
                className="block text-[8px] uppercase tracking-[0.17em]"
              >
                Password
              </label>

              <div className="relative mt-3">
                <input
                  required
                  id="password"
                  type={
                    showPassword ? "text" : "password"
                  }
                  name="password"
                  autoComplete={
                    mode === "login"
                      ? "current-password"
                      : "new-password"
                  }
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="Minimum 6 characters"
                  className="h-13 w-full border border-black/15 bg-transparent px-4 pr-13 text-[11px] outline-none transition placeholder:text-[#9b9189] focus:border-black/50"
                />

                <button
                  type="button"
                  aria-label={
                    showPassword
                      ? "Hide password"
                      : "Show password"
                  }
                  onClick={() =>
                    setShowPassword(
                      (current) => !current
                    )
                  }
                  className="absolute inset-y-0 right-0 flex w-13 items-center justify-center text-[#756a62]"
                >
                  {showPassword ? (
                    <EyeOff
                      size={17}
                      strokeWidth={1.3}
                    />
                  ) : (
                    <Eye
                      size={17}
                      strokeWidth={1.3}
                    />
                  )}
                </button>
              </div>
            </div>

            {message && (
              <div
                className={`mt-5 border px-4 py-3 text-[10px] leading-5 ${
                  messageType === "success"
                    ? "border-[#87927e]/30 bg-[#dfe6d9] text-[#53634c]"
                    : "border-[#9b493f]/20 bg-[#eee1dd] text-[#8e433a]"
                }`}
              >
                {message}
              </div>
            )}

            <button
              type="submit"
              disabled={submitting}
              className="mt-7 flex min-h-13 w-full items-center justify-center bg-[#211c18] px-6 text-[9px] uppercase tracking-[0.21em] text-white transition hover:bg-black disabled:cursor-not-allowed disabled:opacity-60"
            >
              {submitting
                ? "Please Wait"
                : mode === "login"
                  ? "Sign In"
                  : "Create Account"}
            </button>
          </form>

          <div className="mt-7 border-t border-black/10 pt-6 text-center">
            <p className="text-[9px] leading-6 text-[#756a62]">
              {mode === "login"
                ? "New to Haya?"
                : "Already have an account?"}{" "}
              <button
                type="button"
                onClick={() =>
                  changeMode(
                    mode === "login"
                      ? "register"
                      : "login"
                  )
                }
                className="text-[#211c18] underline underline-offset-4"
              >
                {mode === "login"
                  ? "Create an account"
                  : "Sign in"}
              </button>
            </p>

            <Link
              to="/shop"
              className="mt-4 inline-block text-[8px] uppercase tracking-[0.17em] underline underline-offset-4"
            >
              Continue as Guest
            </Link>
          </div>
        </div>
      </section>

      <Footer />
    </main>
  );
}