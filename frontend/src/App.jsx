import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

import Layout from "./Mycomponent/Layout";
import Login from "./Pages/Login";
import Form from "./Pages/Form";
import Admin from "./Pages/Admin";
import Dashboard from "./Mycomponent/Dashboard";
import ProtectedRoute from "./utils/ProtectedRoute";
import Advertisement from "./Mycomponent/Advertisment";
import AddHost from "./Mycomponent/AddHost";
import Submissions from "./Mycomponent/Submissions";
import EditForm from "./Mycomponent/FormEditing";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />

        {/* public pages */}
        <Route element={<Layout />}>
          <Route path="/" element={<Form />} />
        </Route>
        <Route
          path="/admin"
          element={
            <ProtectedRoute>
              <Admin />
            </ProtectedRoute>
          }
        >
          <Route index element={<Navigate to="dashboard" replace />} />
          <Route path="dashboard" element={<Dashboard />} />
          <Route path="host" element={<AddHost />} />
          <Route path="advertise" element={<Advertisement />} />
          <Route path="submissions" element={<Submissions />} />
          <Route path="form" element={<EditForm />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;