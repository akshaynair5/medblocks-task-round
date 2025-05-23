import { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import pgSyncChannel from "../utils/pgLiteBroadcast.js";
import PatientForm from "../components/PatientForm.jsx";
import UpdatePatientModal from "../components/UpdatePatientModal.jsx";
import { fetchPatientsFresh } from "../utils/patientUtils.js";
import toast from "react-hot-toast";
import db from "../db/pglite";

const HomePage = () => {
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [updatePatient, setUpdatePatient] = useState(null);
  const navigate = useNavigate();

  const ensureReady = async () => {
    if (!db.isReady) await db.ready;
  };

  const loadPatients = useCallback(async () => {
    try {
      setLoading(true);
      await ensureReady();
      const rows = await fetchPatientsFresh("SELECT * FROM patients;");
      setPatients(rows);
    } catch (err) {
      console.error(err);
      toast.error("Failed to load patient data.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const handleMessage = (event) => {
      console.log("Broadcast received:", event.data);
      if (event.data === "data-updated") {
        setTimeout(loadPatients, 50);
      }
    };

    pgSyncChannel.addEventListener("message", handleMessage);
    loadPatients();

    return () => {
      pgSyncChannel.removeEventListener("message", handleMessage);
    };
  }, [loadPatients]);

  useEffect(() => {
    const handleKey = (e) => {
      if (e.key === "Escape") {
        setShowModal(false);
        setUpdatePatient(null);
      }
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, []);

  // Delete handler
  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this patient?")) return;

    try {
      await ensureReady();
      await db.exec(`DELETE FROM patients WHERE id=${id};`);
      pgSyncChannel.postMessage("data-updated");
      toast.success("Patient deleted successfully!");
      loadPatients();
    } catch (error) {
      toast.error("Failed to delete patient: " + error.message);
    }
  };

  return (
    <div className="fixed top-0 left-0 h-screen w-screen bg-gradient-to-b from-gray-900 via-gray-800 to-gray-900 text-gray-100 flex flex-col p-8 overflow-auto font-sans">
    {/* Header */}
    <header className="flex justify-between items-center mb-6">
        <h1 className="text-4xl font-extrabold tracking-tight drop-shadow-lg select-none">
        Patient Registry
        </h1>
        <div className="flex gap-3">
        <button
        onClick={() => setShowModal(true)}
        className=" hover:bg-green-500 text-white font-medium px-4 py-1.5 rounded-md transition duration-200 focus:outline-none focus:ring-2 focus:ring-green-400 border border-green-600"
        aria-label="Register Patient"
        >
        + Register
        </button>

        <button
            onClick={() => navigate("/sql")}
            className="hover:bg-green-500 text-white font-medium px-4 py-1.5 rounded-md transition duration-200 focus:outline-none focus:ring-2 focus:ring-green-400 border border-green-600"
            aria-label="Open SQL Console"
        >
            Open SQL Console
        </button>

        </div>
    </header>

    {/* Data Section */}
    <main className="bg-gray-800 rounded-xl p-6 shadow-xl max-h-[65vh] overflow-y-auto">
        {loading ? (
        <p className="animate-pulse text-center text-lg font-medium">
            Loading patients...
        </p>
        ) : patients.length === 0 ? (
        <p className="text-center text-gray-400 text-lg font-light">
            No patients found.
        </p>
        ) : (
        <table className="w-full table-auto border-collapse text-gray-200">
            <thead>
            <tr className="border-b border-gray-600">
                {["ID", "Name", "Age", "Gender", "Ailment", "Actions"].map((title) => (
                <th
                    key={title}
                    className="py-3 px-4 text-left text-sm font-semibold tracking-wide"
                >
                    {title}
                </th>
                ))}
            </tr>
            </thead>
            <tbody>
            {patients.map((p) => (
                <tr
                key={p.id}
                className="border-b border-gray-700 hover:bg-gray-700 transition-colors duration-200 cursor-default"
                >
                <td className="py-3 px-4 text-sm">{p.id}</td>
                <td className="py-3 px-4 text-sm font-medium">{p.name}</td>
                <td className="py-3 px-4 text-sm">{p.age}</td>
                <td className="py-3 px-4 text-sm">{p.gender}</td>
                <td className="py-3 px-4 text-sm">{p.ailment}</td>
                <td className="py-3 px-4 flex gap-3">
                    <button
                    onClick={() => setUpdatePatient(p)}
                    className="bg-yellow-500 hover:bg-yellow-600 transition-colors duration-300 rounded-md px-3 py-1 text-xs font-semibold text-gray-900 shadow-sm hover:shadow-md focus:outline-none focus:ring-2 focus:ring-yellow-400"
                    aria-label={`Update patient ${p.name}`}
                    >
                    Update
                    </button>
                    <button
                    onClick={() => handleDelete(p.id)}
                    className="bg-red-600 hover:bg-red-700 transition-colors duration-300 rounded-md px-3 py-1 text-xs font-semibold text-white shadow-sm hover:shadow-md focus:outline-none focus:ring-2 focus:ring-red-500"
                    aria-label={`Delete patient ${p.name}`}
                    >
                    Delete
                    </button>
                </td>
                </tr>
            ))}
            </tbody>
        </table>
        )}
    </main>

    {/* Register Modal */}
    {showModal && (
        <div
        className="fixed inset-0 bg-black bg-opacity-80 flex items-center justify-center z-50 backdrop-blur-sm animate-fadeIn"
        role="dialog"
        aria-modal="true"
        >
        <div className="bg-gray-900 text-gray-100 rounded-xl p-8 w-[420px] max-w-full relative shadow-2xl transform scale-95 animate-scaleIn">
            <button
            onClick={() => setShowModal(false)}
            className="absolute top-4 right-4 text-red-400 text-3xl font-thin hover:text-red-600 focus:outline-none"
            aria-label="Close register modal"
            >
            &times;
            </button>
            <h2 className="text-2xl mb-6 font-semibold">Register Patient</h2>
            <PatientForm
            onSuccess={() => {
                loadPatients();
                setShowModal(false);
            }}
            />
        </div>
        </div>
    )}

    {/* Update Modal */}
    {updatePatient && (
        <UpdatePatientModal
        patient={updatePatient}
        onClose={() => setUpdatePatient(null)}
        onUpdated={loadPatients}
        />
    )}

    <style>{`
        @keyframes fadeIn {
        from {opacity: 0;}
        to {opacity: 1;}
        }
        @keyframes scaleIn {
        from {transform: scale(0.95);}
        to {transform: scale(1);}
        }
        .animate-fadeIn {
        animation: fadeIn 0.25s ease forwards;
        }
        .animate-scaleIn {
        animation: scaleIn 0.25s ease forwards;
        }
    `}</style>
    </div>
  );
};

export default HomePage;
