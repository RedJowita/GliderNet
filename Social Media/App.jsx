import {
  BrowserRouter,
  Routes,
  Route
} from "react-router-dom";

import Home from "./pages/Home";
import Login from "./pages/Login";
import Register from "./pages/Register";
import PostDetails from "./pages/PostDetails";
import SavedPosts from "./pages/SavedPosts";
import Popular from "./pages/Popular";
import AllPosts from "./pages/AllPosts";

import "./App.css";


function App() {

  return (

    <BrowserRouter>

      <Routes>

        {/* HOME */}
        <Route
          path="/"
          element={<Home />}
        />


        {/* POPULAR POSTS */}
        <Route
          path="/popular"
          element={<Popular />}
        />


        {/* ALL POSTS */}
        <Route
          path="/all"
          element={<AllPosts />}
        />


        {/* SAVED POSTS */}
        <Route
          path="/saved"
          element={<SavedPosts />}
        />


        {/* LOGIN */}
        <Route
          path="/login"
          element={<Login />}
        />


        {/* REGISTER */}
        <Route
          path="/register"
          element={<Register />}
        />


        {/* POST DETAILS / COMMENTS */}
        <Route
          path="/post/:postId"
          element={<PostDetails />}
        />

      </Routes>

    </BrowserRouter>

  );

}


export default App;