import { useState } from "react";
import toast from "react-hot-toast";
import db from "../db/pglite";
import pgSyncChannel from "../utils/pgLiteBroadcast.js";

const UpdatePatientModal = ({ patient, onClose, onUpdated }) => {
  const [form, setForm] = useState({
    name: patient.name,
    age: patient.age,
    gender: patient.gender,
    ailment: patient.ailment,
  });
  const ensureReady = async () => {
    if (!db.isReady) await db.ready;
  };
  const [loading, setLoading] = useState(false);

  const sanitizeInput = (str) => str.replace(/'/g, "''").trim();

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const { name, age, gender, ailment } = form;
    if (!name || !age || !gender || !ailment || isNaN(age)) {
      toast.error("Please fill all fields correctly.");
      return;
    }

    setLoading(true);
    try {
      const safeName = sanitizeInput(name);
      const safeGender = sanitizeInput(gender);
      const safeAilment = sanitizeInput(ailment);
      const safeAge = parseInt(age);
      await ensureReady();
      await db.exec(`
        UPDATE patients
        SET name='${safeName}', age=${safeAge}, gender='${safeGender}', ailment='${safeAilment}'
        WHERE id=${patient.id};
      `);

      pgSyncChannel.postMessage("data-updated");
      toast.success("Patient updated successfully!");
      if (onUpdated) onUpdated();
      onClose();
    } catch (error) {
      toast.error("Update failed: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50">
      <div className="bg-[#1F1F1F] text-white rounded p-6 w-[400px] relative shadow-lg">
        <button
          onClick={onClose}
          className="absolute top-2 right-2 text-red-400 text-2xl"
          aria-label="Close modal"
        >
          &times;
        </button>
        <h2 className="text-xl mb-4">Update Patient</h2>
        <form onSubmit={handleSubmit} className="flex flex-col gap-3">
          <input
            type="text"
            name="name"
            value={form.name}
            onChange={handleChange}
            className="border p-2 dark:bg-[#333] dark:text-white"
            required
            placeholder="Name"
          />
          <input
            type="number"
            name="age"
            value={form.age}
            onChange={handleChange}
            className="border p-2 dark:bg-[#333] dark:text-white"
            required
            placeholder="Age"
            min="0"
          />
          <input
            type="text"
            name="gender"
            value={form.gender}
            onChange={handleChange}
            className="border p-2 dark:bg-[#333] dark:text-white"
            required
            placeholder="Gender"
          />
          <input
            type="text"
            name="ailment"
            value={form.ailment}
            onChange={handleChange}
            className="border p-2 dark:bg-[#333] dark:text-white"
            required
            placeholder="Ailment"
          />
          <button
            type="submit"
            disabled={loading}
            className={`bg-yellow-600 text-white p-2 rounded ${
              loading ? "opacity-50 cursor-not-allowed" : ""
            }`}
          >
            {loading ? "Updating..." : "Update"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default UpdatePatientModal;
