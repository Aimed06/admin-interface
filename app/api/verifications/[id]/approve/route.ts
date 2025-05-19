import { NextResponse } from "next/server"
import { executeQuery } from "@/lib/db"

// POST - Approuver une demande de vérification
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

    // Mettre à jour le statut de la demande
    await executeQuery({
      query: "UPDATE verification_requests SET isValid = 1 WHERE id = ?",
      values: [id],
    })

    // Mettre à jour le statut de vérification de l'utilisateur
    await executeQuery({
      query: 'UPDATE users SET verificationStatus = "1" WHERE id = ?',
      values: [userId],
    })

    // Mettre à jour le rôle de l'utilisateur de CLIENT à VENDOR
    await executeQuery({
      query: 'UPDATE users SET role = "VENDOR" WHERE id = ? AND role = "CLIENT"',
      values: [userId],
    })

    return NextResponse.json({ message: "Demande de vérification approuvée" })
  } catch (error) {
    console.error("Erreur lors de l'approbation de la demande:", error)
    return NextResponse.json({ error: "Erreur lors de l'approbation de la demande" }, { status: 500 })
  }
}
