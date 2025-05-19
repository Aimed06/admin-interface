import { NextResponse } from "next/server";
import { executeQuery } from "@/lib/db";

// GET - Récupérer toutes les demandes de vérification
export async function GET() {
  try {
    const verifications = await executeQuery<any[]>({
      query: `
        SELECT vr.*, u.firstName, u.lastName, u.email, u.phone, u.created_at as userCreatedAt
        FROM verification_requests vr
        JOIN users u ON vr.user_id = u.id
        WHERE vr.isValid = 0
        ORDER BY vr.id DESC
      `,
    });

    return NextResponse.json(verifications);
  } catch (error) {
    console.error(
      "Erreur lors de la récupération des demandes de vérification:",
      error
    );
    return NextResponse.json(
      { error: "Erreur lors de la récupération des demandes de vérification" },
      { status: 500 }
    );
  }
}

// POST - Créer une nouvelle demande de vérification
export async function POST(request: Request) {
  try {
    const { userId, document } = await request.json();

    // Vérifier si l'utilisateur existe
    const users = await executeQuery<any[]>({
      query: "SELECT id FROM users WHERE id = ?",
      values: [userId],
    });

    if (users.length === 0) {
      return NextResponse.json(
        { error: "Utilisateur non trouvé" },
        { status: 404 }
      );
    }

    // Vérifier si une demande existe déjà pour cet utilisateur
    const existingRequests = await executeQuery<any[]>({
      query:
        "SELECT id FROM verification_requests WHERE user_id = ? AND isValid = 0",
      values: [userId],
    });

    if (existingRequests.length > 0) {
      // Mettre à jour la demande existante
      await executeQuery({
        query:
          "UPDATE verification_requests SET document = ? WHERE user_id = ? AND isValid = 0",
        values: [document, userId],
      });

      return NextResponse.json({
        message: "Demande de vérification mise à jour avec succès",
        id: existingRequests[0].id,
      });
    }

    // Créer une nouvelle demande
    const result = await executeQuery<any>({
      query:
        "INSERT INTO verification_requests (document, user_id) VALUES (?, ?)",
      values: [document, userId],
    });

    // Mettre à jour le statut de vérification de l'utilisateur
    await executeQuery({
      query: 'UPDATE users SET verificationStatus = "2" WHERE id = ?',
      values: [userId],
    });

    return NextResponse.json(
      {
        message: "Demande de vérification créée avec succès",
        id: result.insertId,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error(
      "Erreur lors de la création de la demande de vérification:",
      error
    );
    return NextResponse.json(
      { error: "Erreur lors de la création de la demande de vérification" },
      { status: 500 }
    );
  }
}
