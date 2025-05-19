import { NextResponse } from "next/server"
import { executeQuery } from "@/lib/db"

// GET - Récupérer un produit par ID
export async function GET(request: Request, { params }: { params: { id: string } }) {
  try {
    const id = params.id
    const products = await executeQuery<any[]>({
      query: `
        SELECT p.*, c.name as categoryName, 
               CONCAT(u.firstName, ' ', u.lastName) as sellerName
        FROM products p
        LEFT JOIN categories c ON p.categoryId = c.id
        LEFT JOIN users u ON p.sellerId = u.id
        WHERE p.id = ?
      `,
      values: [id],
    })

    if (products.length === 0) {
      return NextResponse.json({ error: "Produit non trouvé" }, { status: 404 })
    }

    return NextResponse.json(products[0])
  } catch (error) {
    console.error("Erreur lors de la récupération du produit:", error)
    return NextResponse.json({ error: "Erreur lors de la récupération du produit" }, { status: 500 })
  }
}

// PUT - Mettre à jour un produit
export async function PUT(request: Request, { params }: { params: { id: string } }) {
  try {
    const id = params.id
    const formData = await request.formData()
    const name = formData.get("name") as string
    const price = formData.get("price") as string
    const categoryId = formData.get("categoryId") as string
    const imageFile = formData.get("image") as File | null

    let updateQuery = "UPDATE products SET name = ?, price = ?, categoryId = ?"
    const values = [name, price, categoryId]

    // Si une nouvelle image est fournie
    if (imageFile) {
      const imageName = `${Date.now()}-${imageFile.name}`
      updateQuery += ", image = ?"
      values.push(imageName)
    }

    updateQuery += " WHERE id = ?"
    values.push(id)

    await executeQuery({
      query: updateQuery,
      values,
    })

    return NextResponse.json({
      id,
      name,
      price,
      categoryId,
      ...(imageFile && { image: `${Date.now()}-${imageFile.name}` }),
    })
  } catch (error) {
    console.error("Erreur lors de la mise à jour du produit:", error)
    return NextResponse.json({ error: "Erreur lors de la mise à jour du produit" }, { status: 500 })
  }
}

// DELETE - Supprimer un produit
export async function DELETE(request: Request, { params }: { params: { id: string } }) {
  try {
    const id = params.id

    await executeQuery({
      query: "DELETE FROM products WHERE id = ?",
      values: [id],
    })

    return NextResponse.json({ message: "Produit supprimé avec succès" })
  } catch (error) {
    console.error("Erreur lors de la suppression du produit:", error)
    return NextResponse.json({ error: "Erreur lors de la suppression du produit" }, { status: 500 })
  }
}
