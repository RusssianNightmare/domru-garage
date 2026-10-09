import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import Garage from './pages/Garage';
import AddDevice from './pages/AddDevice';
import EditDevice from './pages/EditDevice';
import QrScan from './pages/QrScan';
import Diagnostics from './pages/Diagnostics';
import AIAssistant from './pages/AIAssistant';
import Catalog from './pages/Catalog';

function App() {
  return (
    <Router>
      {/* Телефонная рамка: на ПК — узкая колонка как в Figma, на телефоне — весь экран */}
      <div className="min-h-screen bg-gray-300 flex justify-center">
        <div className="w-full max-w-md min-h-screen bg-white shadow-2xl relative">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/garage" element={<Garage />} />
            <Route path="/garage/add" element={<AddDevice />} />
            <Route path="/garage/qr" element={<QrScan />} />
            <Route path="/garage/edit/:id" element={<EditDevice />} />
            <Route path="/diagnostics" element={<Diagnostics />} />
            <Route path="/ai-assistant" element={<AIAssistant />} />
            <Route path="/catalog" element={<Catalog />} />
          </Routes>
        </div>
      </div>
    </Router>
  );
}

export default App;