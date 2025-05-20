import mysql from "mysql2/promise"

// Configuration de la connexion à la base de données
export const db = mysql.createPool({
  host: process.env.MYSQL_HOST || "localhost",
  user: process.env.MYSQL_USER || "root",
  password: process.env.MYSQL_PASSWORD || "",
  database: process.env.MYSQL_DATABASE || "onfrip",
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
})

// Fonction utilitaire pour exécuter des requêtes SQL
export async function executeQuery<T>({ query, values }: { query: string; values?: any[] }): Promise<T> {
  try {
    const [result] = await db.execute(query, values)
    return result as T
  } catch (error) {
    console.error("Erreur de base de données:", error)
    throw new Error("Erreur lors de l'exécution de la requête")
  }
}
