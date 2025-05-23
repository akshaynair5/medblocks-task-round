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
        className="border p-2 dark:bg-[#333] dark:text-white"
        required
      />
      <input
        type="number"
        name="age"
        value={form.age}
        placeholder="Age"
        onChange={handleChange}
        className="border p-2 dark:bg-[#333] dark:text-white"
        required
        min="0"
      />
      <input
        type="text"
        name="gender"
        value={form.gender}
        placeholder="Gender"
        onChange={handleChange}
        className="border p-2 dark:bg-[#333] dark:text-white"
        required
      />
      <input
        type="text"
        name="ailment"
        value={form.ailment}
        placeholder="Ailment"
        onChange={handleChange}
        className="border p-2 dark:bg-[#333] dark:text-white"
        required
      />
      <button
        type="submit"
        disabled={loading}
        className={`bg-green-600 text-white p-2 rounded ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
      >
        {loading ? "Submitting..." : "Submit"}
      </button>
    </form>
  );
};

export default PatientForm;
