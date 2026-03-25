import { Link } from "react-router-dom";


const Header = ({ state, signOut }) => {
  return (
    <>
      <h1>Puppies Database Management</h1>

      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <nav>
          <Link to="/">Home</Link>
          <Link to="/page2">Puppies List</Link>
        </nav>

        <div>{state?.username ?? state?.displayName}</div>
        <button onClick={() => signOut()}>Sign Out</button>
      </div>
    </>
  );
};

export default Header;