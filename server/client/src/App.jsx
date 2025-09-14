import React, { useState } from "react";
import { BrowserRouter as Router, Routes, Route, useLocation } from "react-router-dom";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import {
  Home,
  Register,
  Login,
  RouteError,
  MyStories,
  PublicStories,
  Textedit,
  Output,
} from "../../client/src/pages/Index";
import CustomCursor from "./CustomCursor";
import Ribbon from "./pages/Home/Ribbon"
import GlobalAudio from "./GlobalAudio";

const App = () => {
  const location = useLocation();
  const isTouchScreen = window.matchMedia("(pointer: coarse)").matches;
  const [authChecker, setAuthChecker] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  return (
    <>
    <GlobalAudio  isLoading={isLoading}/>
      {isTouchScreen ? null : <CustomCursor />}
      <ToastContainer position="top-center" autoClose={3000} />
      <Ribbon authChecker={authChecker} setAuthChecker={setAuthChecker} />

      <Routes location={location} key={location.pathname}>
        <Route
          path="/"
          element={<Home authChecker={authChecker} setAuthChecker={setAuthChecker} />}
        />
        <Route
          path="/mystories"
          element={<MyStories authChecker={authChecker} setAuthChecker={setAuthChecker} setGlobalLoading={setIsLoading}/>}
        />
        <Route
          path="/publicstories"
          element={<PublicStories authChecker={authChecker} setAuthChecker={setAuthChecker} setGlobalLoading={setIsLoading}/>}
        />
        <Route
          path="/edittext"
          element={<Textedit authChecker={authChecker} setAuthChecker={setAuthChecker} setGlobalLoading={setIsLoading}/>}
        />
        <Route
          path="/output"
          element={<Output authChecker={authChecker} setAuthChecker={setAuthChecker} setGlobalLoading={setIsLoading}/>}
        >
        </Route>
 <Route
            path="/login"
            element={<Login authChecker={authChecker} setAuthChecker={setAuthChecker} />}
          />
          <Route
            path="/register"
            element={<Register authChecker={authChecker} setAuthChecker={setAuthChecker} />}
          />
        <Route path="*" element={<RouteError />} />
      </Routes>
    </>
  );
};

export default App;