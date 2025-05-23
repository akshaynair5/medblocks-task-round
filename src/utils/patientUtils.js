import { PGlite } from "@electric-sql/pglite";

export const fetchPatientsFresh = async (sqlQuery = "SELECT * FROM patients;") => {
  const db = new PGlite("idb://patient-db");
  await db.ready;
  const result = await db.exec(sqlQuery);
  return result.length > 0 ? result[0].rows : [];
};
