import { NextResponse } from "next/server";
import { join } from "path";
import { readFile } from "fs/promises";
import { existsSync } from "fs";

// Cette route sert à récupérer les fichiers d'upload
export async function GET(
  request: Request,
  { params }: { params: { path: string[] } }
) {
  try {
    // Construire le chemin du fichier
    const filePath = join(process.cwd(), "public", "uploads", ...params.path);

    // Vérifier si le fichier existe
    if (!existsSync(filePath)) {
      console.error(`Fichier non trouvé: ${filePath}`);
      return new NextResponse(null, { status: 404 });
    }

    // Lire le fichier
    const fileBuffer = await readFile(filePath);

    // Déterminer le type MIME en fonction de l'extension
    const fileName = params.path[params.path.length - 1];
    const fileExtension = fileName.split(".").pop()?.toLowerCase();

    let contentType = "application/octet-stream";

    if (fileExtension === "jpg" || fileExtension === "jpeg") {
      contentType = "image/jpeg";
    } else if (fileExtension === "png") {
      contentType = "image/png";
    } else if (fileExtension === "gif") {
      contentType = "image/gif";
    } else if (fileExtension === "pdf") {
      contentType = "application/pdf";
    }

    // Retourner le fichier avec le bon type MIME
    return new NextResponse(fileBuffer, {
      headers: {
        "Content-Type": contentType,
        "Cache-Control": "public, max-age=31536000",
      },
    });
  } catch (error) {
    console.error("Erreur lors de la récupération du fichier:", error);
    return new NextResponse(null, { status: 500 });
  }
}
