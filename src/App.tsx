import "./App.css";

function App() {
  return <p className="bg-orange-500">{import.meta.env.VITE_API_KEY}</p>;
}

export default App;
