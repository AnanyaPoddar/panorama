import { HashRouter, Route, Routes } from "react-router-dom";
import "./App.css";
import Navbar from "./components/Navbar/Navbar";
import ProtectedRoutes from "./components/ProtectedRoutes/ProtectedRoute";
import InactiveRoom from "./components/Room/InactiveRoom";
import Room from "./components/Room/Room";
import EmailVerification from "./components/Signup/EmailVerification";
import SummaryFiles from "./components/SummaryFiles/SummaryFiles";
import Credits from "./views/Credits/Credits";
import Home from "./views/Home/Home";
import Lobby from "./views/Lobby/Lobby";
import Signin from "./views/Signin/Signin";

function App() {
  return (
    <>
      <HashRouter>
        <Navbar />
        <Routes>
          <Route element={<ProtectedRoutes />}>
            <Route path="/room/:id" element={<Room />} />
            <Route path="/room/inactive/:id" element={<InactiveRoom />} />
            <Route path="/lobby" element={<Lobby />} />
            <Route path="/room/summary/:id" element={<SummaryFiles />} />
          </Route>
          <Route path="/signin" element={<Signin />} />
          <Route path="/" element={<Home />} />
          <Route path="/credits" element={<Credits />} />
          <Route
            path="/users/:id/verify/:token"
            element={<EmailVerification />}
          />
        </Routes>
      </HashRouter>
    </>
  );
}

export default App;
