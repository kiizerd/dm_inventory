import Inventory from './components/Inventory/Inventory.tsx';
import './App.css';

const apiBase = (import.meta.env.VITE_API_BASE as string) || '/api';

function App() {
  return <Inventory endpoint={apiBase + '/inventory'} />;
}

export default App;
