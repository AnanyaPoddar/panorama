import "./App.css";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import Room from "./components/Room/Room";
import Lobby from "./views/Lobby/Lobby";
import Navbar from "./components/Navbar/Navbar";
import Home from "./views/Home/Home";
import Signin from "./views/Signin/Signin";

function App() {
  return (
    <>
      <BrowserRouter>
        <Navbar />
        <Routes>
          <Route path="/:id" element={<Room />} />
          <Route path="/lobby" element={<Lobby />} />
          <Route path="/signin" element={<Signin />} />
          <Route path="/" element={<Home />} />
        </Routes>
      </BrowserRouter>
    </>
  );
}

export default App;
