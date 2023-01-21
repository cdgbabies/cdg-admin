import { useState } from "react";

import "./App.css";
import NavbarNew from "./components/ui/NavbarNew";
import { Route, Routes } from "react-router-dom";
import RequireAuth from "./util/RequireAuth";
import Login from "./components/pages/Login";
import Home from "./components/pages/Home";
import Testimonials from "./components/pages/Testimonials";
import Users from "./components/pages/Users";

function App() {
  const [count, setCount] = useState(0);

  return (
    <>
      <NavbarNew />
      <main className="bg-white shadow ">
        <Routes>
        <Route path="/login" element={<Login />} />
        <Route element={<RequireAuth />}>
          <Route path="/" element={<Home />} />
          <Route path="/Blogs" element={<Home />} />
          <Route path="/Testimonials" element={<Testimonials />} />
          <Route path="/Users" element={<Users />} />
        </Route>
        </Routes>
      </main>
    </>
  );
}

export default App;
