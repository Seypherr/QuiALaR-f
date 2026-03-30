import { BrowserRouter, Routes, Route } from "react-router-dom";
import WelcomePage from "./pages/WelcomePage";
import ScanQrCodePage from "./pages/ScanQr";
import Game from "./components/Game";
import MainScreen from "./pages/MainScreen";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<WelcomePage />} />
        <Route path="/scan" element={<ScanQrCodePage />} />
        <Route path="/game" element={<Game />} />
        <Route path="/screen" element={<MainScreen />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
