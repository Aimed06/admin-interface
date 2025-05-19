import { NextResponse } from "next/server"
import { executeQuery } from "@/lib/db"

// GET - Récupérer les statistiques pour le tableau de bord
export async function GET() {
  try {
    // Récupérer le nombre total de produits
    const productsResult = await executeQuery<any[]>({
      query: "SELECT COUNT(*) as count FROM products",
    })
    const totalProducts = productsResult[0].count

    // Récupérer le nombre total d'utilisateurs
    const usersResult = await executeQuery<any[]>({
      query: "SELECT COUNT(*) as count FROM users",
    })
    const totalUsers = usersResult[0].count

    // Récupérer le nombre d'utilisateurs vérifiés
    const verifiedUsersResult = await executeQuery<any[]>({
      query: 'SELECT COUNT(*) as count FROM users WHERE verificationStatus = "1"',
    })
    const verifiedUsers = verifiedUsersResult[0].count

    // Récupérer le nombre de demandes de vérification en attente
    const pendingVerificationsResult = await executeQuery<any[]>({
      query: "SELECT COUNT(*) as count FROM verification_requests WHERE isValid = 0",
    })
    const pendingVerifications = pendingVerificationsResult[0].count

    return NextResponse.json({
      totalProducts,
      totalUsers,
      verifiedUsers,
      pendingVerifications,
    })
  } catch (error) {
    console.error("Erreur lors de la récupération des statistiques:", error)
    return NextResponse.json({ error: "Erreur lors de la récupération des statistiques" }, { status: 500 })
  }
}
