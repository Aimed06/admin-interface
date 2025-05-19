import { NextResponse } from "next/server"
import { executeQuery } from "@/lib/db"

// GET - Récupérer tous les produits avec leurs catégories et vendeurs
export async function GET() {
  try {
    const products = await executeQuery<any[]>({
      query: `
        SELECT p.*, c.name as categoryName, 
               CONCAT(u.firstName, ' ', u.lastName) as sellerName
        FROM products p
        LEFT JOIN categories c ON p.categoryId = c.id
        LEFT JOIN users u ON p.sellerId = u.id
        ORDER BY p.id DESC
      `,
    })

    return NextResponse.json(products)
  } catch (error) {
    console.error("Erreur lors de la récupération des produits:", error)
    return NextResponse.json({ error: "Erreur lors de la récupération des produits" }, { status: 500 })
  }
}

// POST - Ajouter un nouveau produit
export async function POST(request: Request) {
  try {
    const formData = await request.formData()
    const name = formData.get("name") as string
    const price = formData.get("price") as string
    const categoryId = formData.get("categoryId") as string
    const sellerId = formData.get("sellerId") as string
    const imageFile = formData.get("image") as File

    // Gestion de l'image (dans une application réelle, vous utiliseriez un service de stockage)
    // Pour cet exemple, nous supposons que l'image est stockée localement
    const imageName = `${Date.now()}-${imageFile.name}`

    // Insérer le produit dans la base de données
    const result = await executeQuery<any>({
      query: `
        INSERT INTO products (name, price, image, sellerId, categoryId)
        VALUES (?, ?, ?, ?, ?)
      `,
      values: [name, price, imageName, sellerId, categoryId],
    })

    return NextResponse.json(
      {
        id: result.insertId,
        name,
        price,
        image: imageName,
        sellerId,
        categoryId,
      },
      { status: 201 },
    )
  } catch (error) {
    console.error("Erreur lors de l'ajout du produit:", error)
    return NextResponse.json({ error: "Erreur lors de l'ajout du produit" }, { status: 500 })
  }
}
