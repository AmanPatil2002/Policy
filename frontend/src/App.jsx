 import { BrowserRouter, Routes, Route } from "react-router-dom";
 
 import Layout from "./Mycomponent/Layout";
 import Login from "./Pages/Login";
 import Form from "./Pages/Form";
 import Admin from "./Pages/Admin";
import Submissions from "./Mycomponent/Submissions";
import Advertisement from "./Mycomponent/Advertisment";
 // import ProtectedRoutes from "./utils/ProtectedRoutes";
 
 function App() {
   return (
     <BrowserRouter>
       <Routes>
         <Route path="/login" element={<Login />} />
         <Route path="/admin" element={<Admin />} />
         <Route element={<Layout />}>
           <Route path="/" element={<Advertisement />} /> 
         </Route>
         {/* <Route element={<ProtectedRoutes />}>
           <Route path="/admin" element={<Admin />} />
         </Route> */}
       </Routes>
     </BrowserRouter>
   );
 }
 
 export default App;
 