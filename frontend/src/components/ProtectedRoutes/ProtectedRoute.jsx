import { Alert, AlertTitle } from "@mui/material";
import { useContext, useState } from "react";
import { Navigate, Outlet } from "react-router-dom";
import { AuthContext } from "../../context/AuthProvider";

//New standard for React Router V6:
//https://medium.com/@dennisivy/creating-protected-routes-with-react-router-v6-2c4bbaf7bc1c
const ProtectedRoutes = () => {
  const [redirect, setRedirect] = useState(false);

  const { user } = useContext(AuthContext);
  if (!user) {
    setTimeout(() => {
      setRedirect(true);
    }, 3000);
    return (
      <>
        {!redirect && (
          <div className="page protected">
            <Alert severity="error">
              <AlertTitle>401 - Unauthorized</AlertTitle>
              You cannot access this resource. Redirecting to login/signup...
            </Alert>
          </div>
        )}
        {redirect && <Navigate to="/signin" />}
      </>
    );
  }
  //Just return the child as is
  return <Outlet />;
};

export default ProtectedRoutes;
