import { Navigate, Outlet } from "react-router-dom";
import { AuthContext } from "../../context/AuthProvider";
import { useContext, useState } from "react";
import { Alert, AlertTitle } from "@mui/material";

//New standard for React Router V6:
//https://medium.com/@dennisivy/creating-protected-routes-with-react-router-v6-2c4bbaf7bc1c
const ProtectedRoutes = () => {
  const [redirect, setRedirect] = useState(false);

  const { user } = useContext(AuthContext);
  //TODO: Maybe refetch from session to make sure that user actually the user associated with the express session
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
  //TODO: For room, should have some sort of role, and show a 403 when the person does not have access to that room
  //Just return the child as is
  return <Outlet />;
};

export default ProtectedRoutes;
