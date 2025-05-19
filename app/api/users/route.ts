import { NextResponse } from "next/server"
import { executeQuery } from "@/lib/db"

// GET - Récupérer tous les utilisateurs
export async function GET() {
  try {
    const users = await executeQuery<any[]>({
      query: `
        SELECT id, firstName, lastName, email, phone, role, 
               verificationStatus, created_at
        FROM users
        ORDER BY id DESC
      `,
    })

    return NextResponse.json(users)
  } catch (error) {
    console.error("Erreur lors de la récupération des utilisateurs:", error)
    return NextResponse.json({ error: "Erreur lors de la récupération des utilisateurs" }, { status: 500 })
  }
}

// POST - Ajouter un nouvel utilisateur
export async function POST(request: Request) {
  try {
    const { firstName, lastName, email, phone, role } = await request.json()

    // Vérifier si l'email existe déjà
    const existingUsers = await executeQuery<any[]>({
      query: "SELECT id FROM users WHERE email = ?",
      values: [email],
    })

    if (existingUsers.length > 0) {
      return NextResponse.json({ error: "Un utilisateur avec cet email existe déjà" }, { status: 400 })
    }

    // Insérer le nouvel utilisateur
    const result = await executeQuery<any>({
      query: `
        INSERT INTO users (firstName, lastName, email, phone, role)
        VALUES (?, ?, ?, ?, ?)
      `,
      values: [firstName, lastName, email, phone, role || "CLIENT"],
    })

    return NextResponse.json(
      {
        id: result.insertId,
        firstName,
        lastName,
        email,
        phone,
        role: role || "CLIENT",
        verificationStatus: "2",
        created_at: new Date(),
      },
      { status: 201 },
    )
  } catch (error) {
    console.error("Erreur lors de l'ajout de l'utilisateur:", error)
    return NextResponse.json({ error: "Erreur lors de l'ajout de l'utilisateur" }, { status: 500 })
  }
}
