"use server"

import { executeQuery } from "./db"
import { revalidatePath } from "next/cache"

// Action pour récupérer tous les produits
export async function getProducts() {
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

    return { success: true, data: products }
  } catch (error) {
    console.error("Erreur lors de la récupération des produits:", error)
    return { success: false, error: "Erreur lors de la récupération des produits" }
  }
}

// Action pour supprimer un produit
export async function deleteProduct(id: number) {
  try {
    await executeQuery({
      query: "DELETE FROM products WHERE id = ?",
      values: [id],
    })

    revalidatePath("/admin/produits")
    return { success: true }
  } catch (error) {
    console.error("Erreur lors de la suppression du produit:", error)
    return { success: false, error: "Erreur lors de la suppression du produit" }
  }
}

// Action pour récupérer tous les utilisateurs
export async function getUsers() {
  try {
    const users = await executeQuery<any[]>({
      query: `
        SELECT id, firstName, lastName, email, phone, role, 
               verificationStatus, created_at
        FROM users
        ORDER BY id DESC
      `,
    })

    return { success: true, data: users }
  } catch (error) {
    console.error("Erreur lors de la récupération des utilisateurs:", error)
    return { success: false, error: "Erreur lors de la récupération des utilisateurs" }
  }
}

// Action pour supprimer un utilisateur
export async function deleteUser(id: number) {
  try {
    await executeQuery({
      query: "DELETE FROM users WHERE id = ?",
      values: [id],
    })

    revalidatePath("/admin/utilisateurs")
    return { success: true }
  } catch (error) {
    console.error("Erreur lors de la suppression de l'utilisateur:", error)
    return { success: false, error: "Erreur lors de la suppression de l'utilisateur" }
  }
}

// Action pour récupérer les demandes de vérification
export async function getVerificationRequests() {
  try {
    const verifications = await executeQuery<any[]>({
      query: `
        SELECT vr.*, u.firstName, u.lastName, u.email, u.phone, u.created_at as userCreatedAt
        FROM verification_requests vr
        JOIN users u ON vr.user_id = u.id
        WHERE vr.isValid = 0
        ORDER BY vr.id DESC
      `,
    })

    return { success: true, data: verifications }
  } catch (error) {
    console.error("Erreur lors de la récupération des demandes de vérification:", error)
    return { success: false, error: "Erreur lors de la récupération des demandes de vérification" }
  }
}

// Action pour approuver une demande de vérification
export async function approveVerification(id: number) {
  try {
    // Récupérer l'ID de l'utilisateur associé à la demande
    const requests = await executeQuery<any[]>({
      query: "SELECT user_id FROM verification_requests WHERE id = ?",
      values: [id],
    })

    if (requests.length === 0) {
      return { success: false, error: "Demande de vérification non trouvée" }
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

    revalidatePath("/admin/verifications")
    return { success: true }
  } catch (error) {
    console.error("Erreur lors de l'approbation de la demande:", error)
    return { success: false, error: "Erreur lors de l'approbation de la demande" }
  }
}

// Action pour rejeter une demande de vérification
export async function rejectVerification(id: number) {
  try {
    // Récupérer l'ID de l'utilisateur associé à la demande
    const requests = await executeQuery<any[]>({
      query: "SELECT user_id FROM verification_requests WHERE id = ?",
      values: [id],
    })

    if (requests.length === 0) {
      return { success: false, error: "Demande de vérification non trouvée" }
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

    revalidatePath("/admin/verifications")
    return { success: true }
  } catch (error) {
    console.error("Erreur lors du rejet de la demande:", error)
    return { success: false, error: "Erreur lors du rejet de la demande" }
  }
}

// Action pour récupérer les catégories
export async function getCategories() {
  try {
    const categories = await executeQuery<any[]>({
      query: "SELECT * FROM categories ORDER BY name ASC",
    })

    return { success: true, data: categories }
  } catch (error) {
    console.error("Erreur lors de la récupération des catégories:", error)
    return { success: false, error: "Erreur lors de la récupération des catégories" }
  }
}
