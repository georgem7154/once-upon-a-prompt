import Hero from "./Hero";
import { Toaster } from "react-hot-toast";
const Home = ({authChecker,setAuthChecker}) => {
  return (
    <div className="select-none">
    <Toaster position="bottom-right" toastOptions={{ duration: 2000 }} />
      <Hero authChecker={authChecker} setAuthChecker={setAuthChecker}/>
    </div>
  );
};

export default Home;