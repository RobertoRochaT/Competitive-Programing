import { Routes, Route } from "react-router-dom";
import Home from "../pages/Home";
import ProblemListPage from "../features/problems/pages/ProblemPage";
import EditorPage from "../features/editor/pages/EditorPage";

const AppRoutes = () => {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/problems" element={<ProblemListPage />} />
      <Route path="/problems/:slug" element={<EditorPage />} />
    </Routes>
  );
};

export default AppRoutes;
