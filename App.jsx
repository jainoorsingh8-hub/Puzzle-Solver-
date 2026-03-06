import React, { useState, useEffect } from 'react';

const initialSudoku = [
  [3, 0, 6, 5, 0, 8, 4, 0, 0],
  [5, 2, 0, 0, 0, 0, 0, 0, 0],
  [0, 8, 7, 0, 0, 0, 0, 3, 1],
  [0, 0, 3, 0, 1, 0, 0, 8, 0],
  [9, 0, 0, 8, 6, 3, 0, 0, 5],
  [0, 5, 0, 0, 9, 0, 6, 0, 0],
  [1, 3, 0, 0, 0, 0, 2, 5, 0],
  [0, 0, 0, 0, 0, 0, 0, 7, 4],
  [0, 0, 5, 2, 0, 6, 3, 0, 0]
];

// --- COMPONENTS ---
const Sudoku = () => {
  const [grid, setGrid] = useState(initialSudoku);
  const [solved, setSolved] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSolve = async () => {
    setLoading(true);
    try {
      const response = await fetch('http://localhost:5000/api/solve-sudoku', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ board: grid })
      });
      const data = await response.json();
      setGrid(data.solvedBoard);
      setSolved(true);
    } catch (error) {
      console.error("Error solving Sudoku:", error);
      alert("Ensure backend is running on port 5000!");
    }
    setLoading(false);
  };

  const handleReset = () => {
    setGrid(initialSudoku);
    setSolved(false);
  };

  return (
    <div className="flex flex-col items-center">
      <h2 className="text-2xl font-bold text-cyan-400 mb-6">Sudoku Solver</h2>
      <div className="grid grid-cols-9 border-2 border-gray-700 bg-gray-800 p-1 rounded-lg shadow-xl">
        {grid.map((row, rIdx) =>
          row.map((cell, cIdx) => (
            <div
              key={`${rIdx}-${cIdx}`}
              className={`w-10 h-10 flex items-center justify-center border border-gray-600 text-lg font-semibold
                ${(cIdx + 1) % 3 === 0 && cIdx !== 8 ? 'border-r-2 border-r-cyan-500' : ''}
                ${(rIdx + 1) % 3 === 0 && rIdx !== 8 ? 'border-b-2 border-b-cyan-500' : ''}
                ${cell !== 0 ? (initialSudoku[rIdx][cIdx] !== 0 ? 'text-white' : 'text-green-400') : 'text-transparent'}
              `}
            >
              {cell !== 0 ? cell : ''}
            </div>
          ))
        )}
      </div>
      <div className="mt-6 flex gap-4">
        <button onClick={handleSolve} disabled={solved || loading} className="px-6 py-2 bg-cyan-600 hover:bg-cyan-500 text-white rounded-md font-bold transition disabled:opacity-50">
          {loading ? 'Solving...' : 'Solve'}
        </button>
        <button onClick={handleReset} className="px-6 py-2 bg-gray-600 hover:bg-gray-500 text-white rounded-md font-bold transition">Reset</button>
      </div>
    </div>
  );
};

const TowerOfHanoi = () => {
  const [numDisks, setNumDisks] = useState(4);
  const [pegs, setPegs] = useState([Array.from({length: 4}, (_, i) => i + 1), [], []]);
  const [solving, setSolving] = useState(false);

  const handleSolve = async () => {
    setSolving(true);
    try {
      const response = await fetch(`http://localhost:5000/api/solve-hanoi?disks=${numDisks}`);
      const data = await response.json();
      const moves = data.moves;
      
      let currentPegs = [[...pegs[0]], [...pegs[1]], [...pegs[2]]];
      
      for (let i = 0; i < moves.length; i++) {
        await new Promise(r => setTimeout(r, 600)); // Animation delay
        const { from, to } = moves[i];
        const disk = currentPegs[from].shift();
        currentPegs[to].unshift(disk);
        setPegs([[...currentPegs[0]], [...currentPegs[1]], [...currentPegs[2]]]);
      }
    } catch (error) {
      console.error("Error fetching Hanoi moves:", error);
      alert("Ensure backend is running on port 5000!");
    }
    setSolving(false);
  };

  const handleReset = () => {
    setPegs([Array.from({length: numDisks}, (_, i) => i + 1), [], []]);
    setSolving(false);
  };

  useEffect(() => { handleReset(); }, [numDisks]);

  return (
    <div className="flex flex-col items-center w-full max-w-3xl mx-auto">
      <h2 className="text-2xl font-bold text-orange-400 mb-4">Tower of Hanoi</h2>
      <div className="mb-8 flex gap-4 items-center">
        <label className="text-gray-300 font-semibold">Number of Disks: </label>
        <input 
          type="number" min="3" max="8" value={numDisks} 
          onChange={(e) => setNumDisks(parseInt(e.target.value) || 3)}
          className="w-16 px-2 py-1 bg-gray-700 text-white rounded border border-gray-600 outline-none focus:border-orange-500"
          disabled={solving}
        />
      </div>
      
      <div className="flex justify-around items-end w-full h-64 border-b-8 border-gray-700 pb-1 gap-4">
        {pegs.map((peg, pIdx) => (
          <div key={pIdx} className="relative flex flex-col-reverse items-center justify-start w-1/3 h-full pt-4">
            <div className="absolute bottom-0 w-4 h-full bg-gray-600 rounded-t-lg z-0"></div>
            {peg.slice().reverse().map((disk, dIdx) => (
              <div 
                key={disk} 
                className="z-10 h-8 rounded-lg shadow-lg border border-gray-900 transition-all duration-300" 
                style={{ 
                  width: `${30 + disk * 12}%`, 
                  backgroundColor: `hsl(${disk * 45}, 80%, 60%)` 
                }}
              />
            ))}
          </div>
        ))}
      </div>
      
      <div className="mt-8 flex gap-4">
        <button onClick={handleSolve} disabled={solving || pegs[2].length === numDisks} className="px-6 py-2 bg-orange-600 hover:bg-orange-500 text-white rounded-md font-bold transition disabled:opacity-50">Auto Solve</button>
        <button onClick={handleReset} disabled={solving} className="px-6 py-2 bg-gray-600 hover:bg-gray-500 text-white rounded-md font-bold transition disabled:opacity-50">Reset</button>
      </div>
    </div>
  );
};

export default function App() {
  const [activeTab, setActiveTab] = useState('sudoku');

  return (
    <div className="min-h-screen bg-gray-900 text-white font-sans selection:bg-cyan-900">
      <header className="bg-gray-800 p-6 text-center border-b border-gray-700 shadow-lg">
        <h1 className="text-4xl font-extrabold bg-clip-text text-transparent bg-gradient-to-r from-cyan-400 to-pink-500">
          Puzzle Solver Suite
        </h1>
        <p className="text-gray-400 mt-2">React Client (Connects to Node.js API)</p>
      </header>

      <main className="p-6">
        <div className="flex justify-center mb-8 border-b border-gray-700 max-w-md mx-auto">
          <button
            onClick={() => setActiveTab('sudoku')}
            className={`flex-1 py-3 text-lg font-bold transition ${activeTab === 'sudoku' ? 'text-cyan-400 border-b-2 border-cyan-400' : 'text-gray-400 hover:text-white'}`}
          >
            Sudoku
          </button>
          <button
            onClick={() => setActiveTab('hanoi')}
            className={`flex-1 py-3 text-lg font-bold transition ${activeTab === 'hanoi' ? 'text-orange-400 border-b-2 border-orange-400' : 'text-gray-400 hover:text-white'}`}
          >
            Tower of Hanoi
          </button>
        </div>

        <div className="mt-8 transition-all duration-500 ease-in-out">
          {activeTab === 'sudoku' ? <Sudoku /> : <TowerOfHanoi />}
        </div>
      </main>
    </div>
  );
}
