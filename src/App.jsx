import { BrowserRouter, Routes, Route } from "react-router-dom";
import HomePage from "./pages/homePage.jsx";
import SQLQueryPage from "./pages/SQLQueryPage.jsx";

const App = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/sql" element={<SQLQueryPage />} />
      </Routes>
    </BrowserRouter>
  );
};

export default App;
