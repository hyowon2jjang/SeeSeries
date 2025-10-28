import { importSeries } from "./seed/importSeries";

export default function App() {
  return (
    <div>
      <h1>SeeSeries Data Import</h1>
      <button onClick={() => importSeries(1396)}>Breaking Bad Import</button>
    </div>
  );
}
