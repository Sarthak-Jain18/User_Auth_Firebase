import { useContext, useEffect, useState } from "react";
import { AuthContext } from "../AuthContext";
import axios from "axios";
import { signOut } from "firebase/auth";
import { ToastContainer, toast, Bounce } from "react-toastify";
import { auth } from "../firebase";

export default function Home() {
    const { user, token } = useContext(AuthContext);

    useEffect(() => {
        async function fetchProtected() {
            try {
                await axios.get(`${import.meta.env.VITE_API_URL}/api/protected`,
                    { headers: { Authorization: `Bearer ${token}` } });
                    
                toast.info(`Welcome ${user.displayName}`, {
                    icon: false,
                    position: "top-right",
                    autoClose: 3000,
                    hideProgressBar: false,
                    closeOnClick: false,
                    pauseOnHover: true,
                    draggable: false,
                    progress: undefined,
                    theme: "light",
                    transition: Bounce,
                });
            } catch (err) {
                console.error(err);
            }
        }
        if (token) fetchProtected();
    }, [token]);

    async function handleLogout() {
        await signOut(auth);
    };

    return (
        <div className="Home_conatiner">
            <div className="home_page">
                <h4>Welcome <span>{user?.displayName}</span></h4>
                <button className="form_sumbit" onClick={handleLogout}>LOGOUT</button>
            </div>
            <ToastContainer />
        </div>
    );
}
