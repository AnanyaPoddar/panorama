import "./App.css";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import Room from "./components/Room/Room";
import Lobby from "./views/Lobby/Lobby";
import Navbar from "./components/Navbar/Navbar";
import Home from "./views/Home/Home";
import Signin from "./views/Signin/Signin";
import Credits from "./views/Credits/Credits";
import ProtectedRoutes from "./components/ProtectedRoutes/ProtectedRoute";

function App() {
  return (
    <>
      <BrowserRouter>
        <Navbar />
        <Routes>
          <Route element={<ProtectedRoutes />}>
            <Route path="/room/:id" element={<Room />} />
            <Route path="/lobby" element={<Lobby />} />
          </Route>
          <Route path="/signin" element={<Signin />} />
          <Route path="/" element={<Home />} />
          <Route path="/credits" element={<Credits />} />
        </Routes>
      </BrowserRouter>
    </>
  );
}

export default App;
