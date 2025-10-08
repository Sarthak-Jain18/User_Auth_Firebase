import { useState, useContext } from "react";
import { createUserWithEmailAndPassword, updateProfile, GoogleAuthProvider, signInWithPopup } from "firebase/auth";
import { auth } from "../firebase.js";
import axios from "axios";
import { AuthContext } from "../AuthContext.jsx";
import { useNavigate, Link } from "react-router-dom";
import { ToastContainer, toast, Bounce } from "react-toastify";
import { Eye, EyeClosed, CircleCheck, CircleX, Mail, User, Lock } from 'lucide-react';
import { validateEmail, validatePassword, validateName } from "../utils/validation.js";

export default function Signup() {
    const [userName, setUserName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);

    const { } = useContext(AuthContext);
    const navigate = useNavigate();

    function handleError(err) {
        toast.error(
            <span className="toast-inline"><CircleX /> {err}</span>,
            {
                icon: false,
                position: "top-center",
                autoClose: 3000,
                hideProgressBar: false,
                closeOnClick: false,
                pauseOnHover: true,
                draggable: false,
                progress: undefined,
                theme: "colored",
                transition: Bounce,
            }
        );
    };

    function handleSuccess(msg) {
        toast.success(
            <span className="toast-inline"><CircleCheck /> {msg}</span>,
            {
                icon: false,
                position: "top-center",
                autoClose: 1500,
                hideProgressBar: false,
                closeOnClick: false,
                pauseOnHover: true,
                draggable: false,
                progress: undefined,
                theme: "colored",
                transition: Bounce,
            }
        );
    };

    async function handleSignup(e) {
        e.preventDefault();

        // regex validations
        if (!validateName(userName)) {
            handleError("Invalid username! Must start with a letter (3-16 chars).");
            return;
        }

        if (!validateEmail(email)) {
            handleError("Invalid email format!");
            return;
        }

        if (!validatePassword(password)) {
            handleError("Password must be 8+ contains (lowercase, uppercase, digit, symbol).");
            return;
        }

        try {
            const userCredential = await createUserWithEmailAndPassword(auth, email, password);
            // optionally set displayName in Firebase user profile
            await updateProfile(userCredential.user, { displayName: userName });

            // get ID token
            const idToken = await userCredential.user.getIdToken();

            // create profile in backend
            await axios.post(`${import.meta.env.VITE_API_URL}/api/users`, { userName },
                { headers: { Authorization: `Bearer ${idToken}` } });

            handleSuccess("Signup successful");
            setTimeout(() => { navigate("/"); }, 2000);
        } catch (err) {
            // console.error(err);
            if (err.code === "auth/email-already-in-use") {
                handleError("Email is already registered");
            } else if (err.code === "auth/invalid-email") {
                handleError("Invalid email address.");
            } else if (err.code === "auth/weak-password") {
                handleError("Weak password.");
            } else {
                handleError("Signup failed. Please try again.");
            }
        }
    };

    async function handleGoogleLogin() {
        const provider = new GoogleAuthProvider();
        try {
            const result = await signInWithPopup(auth, provider);
            const user = result.user;
            const idToken = await user.getIdToken();

            // send user data to backend
            await axios.post(`${import.meta.env.VITE_API_URL}/api/users/google`, {
                userName: user.displayName,
                email: user.email,
            }, {
                headers: { Authorization: `Bearer ${idToken}` },
            });

            handleSuccess("Logged in with Google!");
            setTimeout(() => navigate("/"), 2000);
        } catch (err) {
            handleError("Google login failed");
            // console.error(err);
        }
    };

    return (
        <div className="Signup_conatiner p-5">
            <div className="row d-flex justify-content-center">
                <div className="col-12 col-md-6 auth_inner_container border rounded-3">
                    <div className="form_container justify-content-center p-3">

                        <div className="my-3"><h2>Signup Account</h2></div>

                        <div className="justify-content-center">
                            <form className="row g-3 needs-validation" noValidate onSubmit={handleSignup}>

                                <div>
                                    <label htmlFor="username" className="form-label"><User className="form_svg" /> Username</label>
                                    <input type="text" id="username" className="form-control" name="username" value={userName}
                                        placeholder="Enter your username" onChange={e => setUserName(e.target.value)} autoComplete="username" />
                                </div>

                                <div>
                                    <label htmlFor="email" className="form-label"><Mail className="form_svg" /> Email</label>
                                    <input type="email" id="email" className="form-control" name="email" value={email}
                                        placeholder="Enter your email" onChange={e => setEmail(e.target.value)} autoComplete="email" />
                                </div>

                                <div style={{ position: "relative" }}>
                                    <label htmlFor="password" className="form-label"><Lock className="form_svg" /> Password</label>
                                    <input type={showPassword ? "text" : "password"} id="password" className="form-control" name="password" value={password}
                                        placeholder="Enter your password" onChange={e => setPassword(e.target.value)} autoComplete="current-password" />
                                    {/*Eye toggle button */}
                                    <span onClick={() => setShowPassword(!showPassword)}
                                        style={{
                                            position: "absolute", right: "20px", top: "70%",
                                            transform: "translateY(-50%)", cursor: "pointer", color: "#555"
                                        }}>
                                        {showPassword ? <Eye size={20} /> : <EyeClosed size={20} />}
                                    </span>
                                </div>

                                <button className="form_sumbit" type="submit">Signup</button>

                                <div>
                                    Already have an account? <Link className="acc-auth-link" to={"/login"}>Login</Link>
                                </div>

                            </form>
                        </div>

                        <div className="text-center my-3 d-flex align-items-center">
                            <div className="flex-grow-1 border-top"></div>
                            <span className="mx-2 text-muted fw-semibold">OR</span>
                            <div className="flex-grow-1 border-top"></div>
                        </div>

                        <button onClick={handleGoogleLogin} className="google-btn w-100 d-flex align-items-center justify-content-center gap-2">
                            <img src="/google_icon.png" alt="Google" /> Continue with Google
                        </button>

                        <ToastContainer />
                    </div>
                </div>
            </div>
        </div>
    );
}

