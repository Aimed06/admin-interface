import { NextResponse } from "next/server"
import { executeQuery } from "@/lib/db"

// GET - Récupérer une catégorie par ID
export async function GET(request: Request, { params }: { params: { id: string } }) {
  try {
    const id = params.id
    const categories = await executeQuery<any[]>({
      query: "SELECT * FROM categories WHERE id = ?",
      values: [id],
    })

    if (categories.length === 0) {
      return NextResponse.json({ error: "Catégorie non trouvée" }, { status: 404 })
    }

    return NextResponse.json(categories[0])
  } catch (error) {
    console.error("Erreur lors de la récupération de la catégorie:", error)
    return NextResponse.json({ error: "Erreur lors de la récupération de la catégorie" }, { status: 500 })
  }
}

// PUT - Mettre à jour une catégorie
export async function PUT(request: Request, { params }: { params: { id: string } }) {
  try {
    const id = params.id
    const { name } = await request.json()

    await executeQuery({
      query: "UPDATE categories SET name = ? WHERE id = ?",
      values: [name, id],
    })

    return NextResponse.json({ id, name })
  } catch (error) {
    console.error("Erreur lors de la mise à jour de la catégorie:", error)
    return NextResponse.json({ error: "Erreur lors de la mise à jour de la catégorie" }, { status: 500 })
  }
}

// DELETE - Supprimer une catégorie
export async function DELETE(request: Request, { params }: { params: { id: string } }) {
  try {
    const id = params.id

    await executeQuery({
      query: "DELETE FROM categories WHERE id = ?",
      values: [id],
    })

    return NextResponse.json({ message: "Catégorie supprimée avec succès" })
  } catch (error) {
    console.error("Erreur lors de la suppression de la catégorie:", error)
    return NextResponse.json({ error: "Erreur lors de la suppression de la catégorie" }, { status: 500 })
  }
}
