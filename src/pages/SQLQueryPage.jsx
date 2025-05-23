import { useEffect, useState } from "react";
import db from "../db/pglite";
import toast from "react-hot-toast";
import pgSyncChannel from '../utils/pgLiteBroadcast.js';

const SQLQueryPage = () => {
  const [sql, setSql] = useState("SELECT * FROM patients;");
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [queryHistory, setQueryHistory] = useState([]);
  const [showInstructions, setShowInstructions] = useState(false);

  const isMutatingQuery = (query) => {
    const lower = query.trim().toLowerCase();
    return lower.startsWith("insert") || lower.startsWith("update") || lower.startsWith("delete");
  };

  const handleExecute = async () => {
    setLoading(true);
    setError(null);

    try {
      const trimmedQuery = sql.trim();
      if (!queryHistory.includes(trimmedQuery)) {
        setQueryHistory((prev) => [trimmedQuery, ...prev].slice(0, 10));
      }

      const res = await db.exec(trimmedQuery);

      if (isMutatingQuery(trimmedQuery)) {
        pgSyncChannel.postMessage("data-updated");
        toast.success("Database updated successfully.");
      }

      if (res.length > 0 && Array.isArray(res[0].rows)) {
        setResult(res[0].rows);
      } else {
        setResult([]);
      }
    } catch (error) {
      console.error("SQL Error:", error);
      toast.error("Error executing SQL: " + error.message);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-8 bg-[#121212] text-white flex flex-col mx-auto fixed top-0 left-0 h-screen w-screen overflow-y-scroll">

        <h2 className="text-4xl font-extrabold mb-6 select-none tracking-wide">
            SQL Console
        </h2>

        <div className="mb-6">
          <button
            onClick={() => setShowInstructions(!showInstructions)}
            className="text-sm text-blue-400 hover:underline focus:outline-none flex items-center gap-1"
            aria-expanded={showInstructions}
            aria-controls="instructions-panel"
          >
            {showInstructions ? (
              <>
                <span>Hide Insert Instructions</span>
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M5.23 7.21a.75.75 0 011.06.02L10 11.085l3.71-3.855a.75.75 0 111.08 1.04l-4.25 4.415a.75.75 0 01-1.08 0l-4.25-4.415a.75.75 0 01.02-1.06z" clipRule="evenodd" />
                </svg>
              </>
            ) : (
              <>
                <span>Show Insert Instructions</span>
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M14.77 12.79a.75.75 0 01-1.06-.02L10 8.915l-3.71 3.855a.75.75 0 11-1.08-1.04l4.25-4.415a.75.75 0 011.08 0l4.25 4.415a.75.75 0 01-.02 1.06z" clipRule="evenodd" />
                </svg>
              </>
            )}
          </button>

          <div
            id="instructions-panel"
            className={`transition-all duration-500 overflow-hidden ${
              showInstructions ? "max-h-[600px] mt-4" : "max-h-0"
            }`}
          >
            <div className="bg-[#1E1E1E] border border-gray-700 rounded-lg p-5 text-sm text-gray-300 shadow-sm">
              <h3 className="text-lg font-semibold text-white mb-2">Insert Instructions</h3>
              <p className="mb-2">
                To insert data into the{" "}
                <code className="text-green-400 font-mono">patients</code> table, use:
              </p>
              <pre className="bg-[#151515] p-3 rounded-md text-green-300 font-mono overflow-x-auto">
                INSERT INTO patients (name, age, gender, ailment) VALUES ('John Doe', 45, 'Male', 'Flu');
              </pre>

              <p className="mt-4"><strong>Column descriptions:</strong></p>
              <ul className="list-disc list-inside space-y-1 mt-2">
                <li><span className="text-white font-medium">id</span> – Auto-incremented (skip this)</li>
                <li><span className="text-white font-medium">name</span> – Full name (e.g., <code className="text-blue-400">'Jane Doe'</code>)</li>
                <li><span className="text-white font-medium">age</span> – Number (e.g., <code className="text-blue-400">32</code>)</li>
                <li><span className="text-white font-medium">gender</span> – Text (e.g., <code className="text-blue-400">'Male'</code>)</li>
                <li><span className="text-white font-medium">ailment</span> – Reason for visit (e.g., <code className="text-blue-400">'Fever'</code>)</li>
              </ul>
            </div>
          </div>
        </div>


        <div className="mb-6 flex flex-col">
            <label
            htmlFor="sql-input"
            className="mb-2 text-sm text-gray-400 font-medium tracking-wide"
            >
            Write your SQL query:
            </label>
            <textarea
            id="sql-input"
            value={sql}
            onChange={(e) => setSql(e.target.value)}
            rows={6}
            className="w-full p-4 text-sm bg-[#1E1E1E] text-white rounded-lg resize-none border border-gray-700
                        focus:outline-none focus:ring-4 focus:ring-blue-500 transition-shadow duration-300 shadow-sm"
            placeholder="SELECT * FROM patients WHERE age > 30;"
            />
            <button
            onClick={handleExecute}
            disabled={loading}
            className={`mt-4 self-start bg-blue-600 px-7 py-3 rounded-lg font-semibold tracking-wide
                        hover:bg-blue-700 active:scale-95 transform transition duration-150
                        focus:outline-none focus:ring-4 focus:ring-blue-500 focus:ring-opacity-50
                        ${loading ? "opacity-60 cursor-not-allowed" : "cursor-pointer"}`}
            aria-busy={loading}
            >
            {loading ? (
                <span className="flex items-center gap-2 animate-pulse">
                Executing...
                <svg
                    className="animate-spin h-5 w-5 text-white"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                >
                    <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                    ></circle>
                    <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
                    ></path>
                </svg>
                </span>
            ) : (
                "Execute"
            )}
            </button>
        </div>

        {error && (
            <div
            className="text-red-400 bg-red-900 rounded-lg p-4 mb-6 shadow-md
                        border border-red-700 font-medium select-text"
            role="alert"
            aria-live="assertive"
            >
            <strong>Error:</strong> {error}
            </div>
        )}
        
        {Array.isArray(result) && result.length === 0 && !error && (
            <p className="mt-4 text-gray-400 italic select-none">No results found.</p>
        )}

        {Array.isArray(result) && result.length > 0 && (
            <div
            className="mt-4 overflow-auto rounded-lg border border-gray-600 shadow-inner
                        max-h-[40vh] transition-all duration-300"
            tabIndex={0}
            aria-label="Query results table"
            >
            <table className="w-full text-left border-collapse">
                <thead>
                <tr className="bg-[#1F1F1F] sticky top-0 z-10">
                    {Object.keys(result[0]).map((col) => (
                    <th
                        key={col}
                        className="border-b border-gray-600 p-3 text-sm font-semibold text-gray-300 tracking-wide select-none"
                    >
                        {col}
                    </th>
                    ))}
                </tr>
                </thead>
                <tbody>
                {result.map((row, i) => (
                    <tr
                    key={i}
                    className="hover:bg-[#2A2A2A] transition-colors duration-200 cursor-default"
                    >
                    {Object.keys(result[0]).map((col) => (
                        <td
                        key={col}
                        className="border-b border-gray-700 p-3 text-sm truncate max-w-xs"
                        title={row[col]}
                        >
                        {row[col]}
                        </td>
                    ))}
                    </tr>
                ))}
                </tbody>
            </table>
            </div>
        )}

        {queryHistory.length > 0 && (
            <section className="mt-10">
            <h3 className="text-xl mb-3 text-gray-300 font-semibold tracking-wide select-none">
                Recent Queries
            </h3>
            <ul className="space-y-2 max-h-48 overflow-y-auto scrollbar-thin scrollbar-thumb-blue-600 scrollbar-track-[#1E1E1E]">
                {queryHistory.map((q, idx) => (
                <li key={idx}>
                    <button
                    onClick={() => setSql(q)}
                    className="text-blue-400 hover:underline bg-[#1E1E1E] px-4 py-2 rounded-lg
                                w-full text-left transition-colors duration-200
                                focus:outline-none focus:ring-2 focus:ring-blue-500"
                    aria-label={`Load query: ${q}`}
                    >
                    {q.length > 60 ? q.slice(0, 57) + "..." : q}
                    </button>
                </li>
                ))}
            </ul>
            </section>
        )}
        </div>

  );
};

export default SQLQueryPage;
