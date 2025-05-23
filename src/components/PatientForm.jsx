import { useState } from "react";
import db from "../db/pglite";
import toast from "react-hot-toast";
import pgSyncChannel from "../utils/pgLiteBroadcast.js";

const PatientForm = ({ onSuccess }) => {
  const [form, setForm] = useState({
    name: "",
    age: "",
    gender: "",
    ailment: ""
  });
  const ensureReady = async () => {
    if (!db.isReady) await db.ready;
  };

  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const sanitizeInput = (str) => str.replace(/'/g, "''").trim();

  const handleSubmit = async (e) => {
    e.preventDefault();

    const { name, age, gender, ailment } = form;
    if (!name || !age || !gender || !ailment || isNaN(age)) {
      toast.error("Please fill in all fields correctly.");
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
        INSERT INTO patients (name, age, gender, ailment)
        VALUES ('${safeName}', ${safeAge}, '${safeGender}', '${safeAilment}');
      `);

      pgSyncChannel.postMessage("data-updated");
      toast.success("Patient registered successfully!");
      if (onSuccess) onSuccess();

      setForm({ name: "", age: "", gender: "", ailment: "" });
    } catch (error) {
      console.error(error);
      toast.error("Error: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-3 p-4">
      <input
        type="text"
        name="name"
        value={form.name}
        placeholder="Name"
        onChange={handleChange}
        className="w-full px-4 py-2 border border-gray-500 bg-transparent text-white rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 placeholder-gray-400 transition"
      />

      <input
        type="number"
        name="age"
        value={form.age}
        placeholder="Age"
        onChange={handleChange}
        min="0"
        className="w-full px-4 py-2 border border-gray-500 bg-transparent text-white rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 placeholder-gray-400 transition"
      />

      <select
        name="gender"
        value={form.gender}
        onChange={handleChange}
        className="w-full px-4 py-2 border border-gray-500 bg-gray-900 text-white rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 transition"
        required
      >
        <option className="text-white" value="">Select Gender</option>
        <option className="text-white" value="Male">Male</option>
        <option className="text-white" value="Female">Female</option>
        <option className="text-white" value="Other">Other</option>
      </select>

      <input
        type="text"
        name="ailment"
        value={form.ailment}
        placeholder="Ailment"
        onChange={handleChange}
        className="w-full px-4 py-2 border border-gray-500 bg-transparent text-white rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 placeholder-gray-400 transition"
      />

      <button
        type="submit"
        disabled={loading}
        className={`w-full mt-4 bg-green-600 hover:bg-green-700 text-white font-semibold py-2 px-4 rounded-md transition duration-300 ${
          loading ? 'opacity-50 cursor-not-allowed' : ''
        }`}
      >
        {loading ? "Submitting..." : "Submit"}
      </button>

    </form>
  );
};

export default PatientForm;
