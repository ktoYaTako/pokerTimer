import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { HomePage } from './pages/HomePage';
import { AdminPage } from './pages/AdminPage';
import { DisplayPage } from './pages/DisplayPage';
import './App.css';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/admin/:id" element={<AdminPage />} />
        <Route path="/display/:id" element={<DisplayPage />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
