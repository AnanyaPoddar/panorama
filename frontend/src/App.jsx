import "./App.css";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import Room from "./components/Room/Room";
import Lobby from "./views/Lobby/Lobby";
import Navbar from "./components/Navbar/Navbar";
import Home from "./views/Home/Home";
import Signin from "./views/Signin/Signin";
import EmailVerification from "./components/Signup/EmailVerification";
import Credits from "./views/Credits/Credits";
import ProtectedRoutes from "./components/ProtectedRoutes/ProtectedRoute";
import InactiveRoom from "./components/Room/InactiveRoom";
import SummaryFiles from "./components/SummaryFiles/SummaryFiles";

function App() {
  return (
    <>
      <BrowserRouter>
        <Navbar />
        <Routes>
          <Route element={<ProtectedRoutes />}>
            <Route path="/room/:id" element={<Room />} />
            <Route path="/room/inactive/:id" element={<InactiveRoom />} />
            <Route path="/lobby" element={<Lobby />} />
          </Route>
          <Route path="/room/summary/:id" element={<SummaryFiles/>} />
          <Route path="/signin" element={<Signin />} />
          <Route path="/" element={<Home />} />
          <Route path="/credits" element={<Credits />} />
          <Route path="/users/:id/verify/:token" element={<EmailVerification />} />
        </Routes>
      </BrowserRouter>
    </>
  );
}

export default App;
