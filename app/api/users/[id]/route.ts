import { NextResponse } from "next/server"
import { executeQuery } from "@/lib/db"

// GET - Récupérer un utilisateur par ID
export async function GET(request: Request, { params }: { params: { id: string } }) {
  try {
    const id = params.id
    const users = await executeQuery<any[]>({
      query: `
        SELECT id, firstName, lastName, email, phone, role, 
               verificationStatus, created_at
        FROM users
        WHERE id = ?
      `,
      values: [id],
    })

    if (users.length === 0) {
      return NextResponse.json({ error: "Utilisateur non trouvé" }, { status: 404 })
    }

    return NextResponse.json(users[0])
  } catch (error) {
    console.error("Erreur lors de la récupération de l'utilisateur:", error)
    return NextResponse.json({ error: "Erreur lors de la récupération de l'utilisateur" }, { status: 500 })
  }
}

// PUT - Mettre à jour un utilisateur
export async function PUT(request: Request, { params }: { params: { id: string } }) {
  try {
    const id = params.id
    const { firstName, lastName, email, phone, role } = await request.json()

    // Vérifier si l'email existe déjà pour un autre utilisateur
    const existingUsers = await executeQuery<any[]>({
      query: "SELECT id FROM users WHERE email = ? AND id != ?",
      values: [email, id],
    })

    if (existingUsers.length > 0) {
      return NextResponse.json({ error: "Un autre utilisateur avec cet email existe déjà" }, { status: 400 })
    }

    await executeQuery({
      query: `
        UPDATE users 
        SET firstName = ?, lastName = ?, email = ?, phone = ?, role = ?
        WHERE id = ?
      `,
      values: [firstName, lastName, email, phone, role, id],
    })

    return NextResponse.json({
      id,
      firstName,
      lastName,
      email,
      phone,
      role,
    })
  } catch (error) {
    console.error("Erreur lors de la mise à jour de l'utilisateur:", error)
    return NextResponse.json({ error: "Erreur lors de la mise à jour de l'utilisateur" }, { status: 500 })
  }
}

// DELETE - Supprimer un utilisateur
export async function DELETE(request: Request, { params }: { params: { id: string } }) {
  try {
    const id = params.id

    await executeQuery({
      query: "DELETE FROM users WHERE id = ?",
      values: [id],
    })

    return NextResponse.json({ message: "Utilisateur supprimé avec succès" })
  } catch (error) {
    console.error("Erreur lors de la suppression de l'utilisateur:", error)
    return NextResponse.json({ error: "Erreur lors de la suppression de l'utilisateur" }, { status: 500 })
  }
}
