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
import MyCommunities from "./pages/MyCommunities";
import Settings from "./pages/Settings";
import DirectMessages from "./pages/DirectMessages";
import Friends from "./pages/Friends";

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


        {/* MY COMMUNITIES */}
        <Route
          path="/my-communities"
          element={<MyCommunities />}
        />


        {/* SAVED POSTS */}
        <Route
          path="/saved"
          element={<SavedPosts />}
        />


        {/* SETTINGS */}
        <Route
          path="/settings"
          element={<Settings />}
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



        {/* DMS */}
        <Route
          path="/messages"
          element={<DirectMessages />}
        />



        {/* FRIENDS */}
        <Route
          path="/friends"
          element={<Friends />}
        />

      </Routes>

    </BrowserRouter>

  );

}


export default App;