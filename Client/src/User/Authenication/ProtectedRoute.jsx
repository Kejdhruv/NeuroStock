import React, { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import { toast } from "react-toastify";

const ProtectedRoute = ({ children }) => {
  const [verified, setVerified] = useState(null); 

  useEffect(() => {
    const verifyUser = async () => {
      try {
        const res = await fetch("http://localhost:3001/Auth/Me", {
          credentials: "include"
        });
        const data = await res.json();

        if (!data.loggedIn) {
          toast.error("Please login first!");
          setVerified(false);
        } else {
          setVerified(true);
        }
      } catch (err) {
        toast.error("Auth verification failed!" , err );
        setVerified(false);
      }
    };

    verifyUser();
  }, []);

  if (verified === null) {
    return <div>Loading...</div>; // Or your loader if you want later
  }

  return verified ? children : <Navigate to="/" />;
};

export default ProtectedRoute;