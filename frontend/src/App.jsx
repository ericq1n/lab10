import './App.css'
import Header from './components/Header'
import Footer from './components/Footer'
import Home from "./pages/Home";
import Page2 from "./pages/Page2";
import { Routes, Route } from "react-router-dom";
import { useAuthContext } from "@asgardeo/auth-react";

function App() {
  const { state, signIn, signOut } = useAuthContext();

  return (
    <>
      {state?.isAuthenticated ? (
        <div>
          <Header state={state} signOut={signOut}/>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/page2" element={<Page2 />} />
          </Routes>
          <Footer />
        </div>
      ) : (
        <>
        <h2>Please sign in to access this app</h2>
        <button onClick={() => signIn()}>Sign In</button>
        </>
      )}
    </>
  )
}

export default App
