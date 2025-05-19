import { NextResponse } from "next/server"
import { executeQuery } from "@/lib/db"

// GET - Récupérer toutes les catégories
export async function GET() {
  try {
    const categories = await executeQuery<any[]>({
      query: "SELECT * FROM categories ORDER BY name ASC",
    })

    return NextResponse.json(categories)
  } catch (error) {
    console.error("Erreur lors de la récupération des catégories:", error)
    return NextResponse.json({ error: "Erreur lors de la récupération des catégories" }, { status: 500 })
  }
}

// POST - Ajouter une nouvelle catégorie
export async function POST(request: Request) {
  try {
    const { name } = await request.json()

    // Générer un ID unique (UUID v4 simplifié)
    const id = "cat_" + Math.random().toString(36).substring(2, 15)

    await executeQuery({
      query: "INSERT INTO categories (id, name) VALUES (?, ?)",
      values: [id, name],
    })

    return NextResponse.json({ id, name }, { status: 201 })
  } catch (error) {
    console.error("Erreur lors de l'ajout de la catégorie:", error)
    return NextResponse.json({ error: "Erreur lors de l'ajout de la catégorie" }, { status: 500 })
  }
}
