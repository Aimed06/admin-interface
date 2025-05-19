import { NextResponse } from "next/server"
import { executeQuery } from "@/lib/db"

// POST - Rejeter une demande de vérification
export async function POST(request: Request, { params }: { params: { id: string } }) {
  try {
    const id = params.id

    // Récupérer l'ID de l'utilisateur associé à la demande
    const requests = await executeQuery<any[]>({
      query: "SELECT user_id FROM verification_requests WHERE id = ?",
      values: [id],
    })

    if (requests.length === 0) {
      return NextResponse.json({ error: "Demande de vérification non trouvée" }, { status: 404 })
    }

    const userId = requests[0].user_id

    // Supprimer la demande de vérification
    await executeQuery({
      query: "DELETE FROM verification_requests WHERE id = ?",
      values: [id],
    })

    // Mettre à jour le statut de vérification de l'utilisateur
    await executeQuery({
      query: 'UPDATE users SET verificationStatus = "2" WHERE id = ?',
      values: [userId],
    })

    return NextResponse.json({ message: "Demande de vérification rejetée" })
  } catch (error) {
    console.error("Erreur lors du rejet de la demande:", error)
    return NextResponse.json({ error: "Erreur lors du rejet de la demande" }, { status: 500 })
  }
}
