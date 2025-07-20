import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Editor from './pages/Editor';
import Dashboard from './pages/Dashboard';
import { Toaster } from 'sonner'; 

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/editor/:id" element={<Editor />} />
      </Routes>
      <Toaster richColors position="top-center" />
    </Router>
  );
}

export default App;
