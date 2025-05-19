// Configuration de l'application
export const config = {
  // URL de base pour les images de documents
  documentBaseUrl: process.env.DOCUMENT_BASE_URL || "http://localhost:3000/uploads",

  // Dossier de stockage des documents
  uploadDir: process.env.UPLOAD_DIR || "./public/uploads",
}
