import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import Pendulum from './experiments/Pendulum';
import SolarSystem from './experiments/SolarSystem';
import FreeFall from './experiments/FreeFall';
import ChemicalReaction from './experiments/ChemicalReaction';
import Refraction from './experiments/Refraction';
import Archimedes from './experiments/Archimedes';
import Circuit from './experiments/Circuit';
import Redox from './experiments/Redox';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/experiment/pendulum" element={<Pendulum />} />
        <Route path="/experiment/freefall" element={<FreeFall />} />
        <Route path="/experiment/chemical" element={<ChemicalReaction />} />
        <Route path="/experiment/refraction" element={<Refraction />} />
        <Route path="/experiment/archimedes" element={<Archimedes />} />
        <Route path="/experiment/circuit" element={<Circuit />} />
        <Route path="/experiment/solarsystem" element={<SolarSystem />} />
        <Route path="/experiment/redox" element={<Redox />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
