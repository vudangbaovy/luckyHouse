import './App.css';
import {
  Home,
  Login,
  UserView,
  AdminView,
  GuestView
} from "./pages";
import Navbar from "./components/Navbar";

function App() {
  return (
    <div>
        <Navbar/>
        <Routes>
            <Route path="/" element={<Home />}>
            <Route path="/login" element={<Login />} />
            <Route path="/user" element={<UserView />} />
            <Route path="/admin" element={<AdminView />} />
            <Route path="/guest" element={<GuestView />} />
            </Route>
      </Routes>
    </div>
  );
}

export default App;
