"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CheckCircle, XCircle, Eye, FileImage } from "lucide-react";
import {
  getVerificationRequests,
  approveVerification,
  rejectVerification,
} from "@/lib/actions";
import { useToast } from "@/hooks/use-toast";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

// Composant pour afficher une image avec fallback
const VerificationImage = ({ document, onClick }) => {
  const [error, setError] = useState(false);

  // Pour cet exemple, nous allons simuler des images de documents
  // Dans un environnement réel, vous utiliseriez l'URL réelle des images
  const placeholderImages = [
    "/placeholder.svg?height=400&width=600&text=Document+ID",
    "/placeholder.svg?height=400&width=600&text=Carte+Identité",
    "/placeholder.svg?height=400&width=600&text=Passeport",
  ];

  // Sélectionner une image de placeholder basée sur le nom du document
  const getPlaceholderImage = () => {
    const hash = document
      .split("")
      .reduce((acc, char) => acc + char.charCodeAt(0), 0);
    return placeholderImages[hash % placeholderImages.length];
  };

  return (
    <div className="relative h-48 w-full overflow-hidden rounded-md border bg-gray-100 flex items-center justify-center">
      {error ? (
        <div className="flex flex-col items-center justify-center text-gray-500">
          <FileImage className="h-10 w-10 mb-2" />
          <p className="text-sm">{document}</p>
        </div>
      ) : (
        <>
          <img
            src={getPlaceholderImage() || "/placeholder.svg"}
            alt="Document d'identité"
            className="h-full w-full object-contain"
            onError={() => setError(true)}
          />
          <Button
            variant="outline"
            className="absolute inset-0 w-full h-full opacity-90 hover:opacity-100 flex items-center justify-center"
            onClick={onClick}
          >
            <Eye className="mr-2 h-4 w-4" />
            Voir le document
          </Button>
        </>
      )}
    </div>
  );
};

export default function VerificationsPage() {
  const [verifications, setVerifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedDocument, setSelectedDocument] = useState(null);
  const [openDialog, setOpenDialog] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    async function fetchVerifications() {
      try {
        const result = await getVerificationRequests();
        if (result.success) {
          setVerifications(result.data);
        } else {
          toast({
            title: "Erreur",
            description:
              result.error ||
              "Impossible de charger les demandes de vérification",
            variant: "destructive",
          });
        }
      } catch (error) {
        toast({
          title: "Erreur",
          description: "Impossible de charger les demandes de vérification",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    }

    fetchVerifications();
  }, [toast]);

  const handleApprove = async (id) => {
    try {
      const result = await approveVerification(id);
      if (result.success) {
        setVerifications(
          verifications.filter((verification) => verification.id !== id)
        );
        toast({
          title: "Succès",
          description:
            "Utilisateur vérifié avec succès et promu au rôle de vendeur",
        });
      } else {
        toast({
          title: "Erreur",
          description: result.error || "Impossible d'approuver la vérification",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Impossible d'approuver la vérification",
        variant: "destructive",
      });
    }
  };

  const handleReject = async (id) => {
    try {
      const result = await rejectVerification(id);
      if (result.success) {
        setVerifications(
          verifications.filter((verification) => verification.id !== id)
        );
        toast({
          title: "Succès",
          description: "Demande de vérification rejetée",
        });
      } else {
        toast({
          title: "Erreur",
          description: result.error || "Impossible de rejeter la vérification",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Impossible de rejeter la vérification",
        variant: "destructive",
      });
    }
  };

  const openImageDialog = (document) => {
    setSelectedDocument(document);
    setOpenDialog(true);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Vérifications d'identité</h1>
        <Badge variant="outline" className="text-sm">
          {verifications.length} en attente
        </Badge>
      </div>

      {loading ? (
        <div className="flex h-40 items-center justify-center">
          <p>Chargement des demandes de vérification...</p>
        </div>
      ) : verifications.length === 0 ? (
        <div className="flex h-[300px] items-center justify-center rounded-md border border-dashed">
          <div className="text-center">
            <h3 className="text-lg font-medium">
              Aucune vérification en attente
            </h3>
            <p className="text-sm text-gray-500">
              Toutes les vérifications d'identité ont été traitées.
            </p>
          </div>
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {verifications.map((verification) => (
            <Card key={verification.id}>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <div className="h-12 w-12 rounded-full bg-gray-200 flex items-center justify-center">
                    <span className="text-sm font-medium">
                      {verification.firstName.charAt(0)}
                      {verification.lastName.charAt(0)}
                    </span>
                  </div>
                  <div>
                    {verification.firstName} {verification.lastName}
                    <CardDescription>{verification.email}</CardDescription>
                  </div>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-500">Téléphone:</span>
                    <span className="text-sm">{verification.phone}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-500">Document:</span>
                    <span className="text-sm truncate max-w-[150px]">
                      {verification.document}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-500">
                      Date d'inscription:
                    </span>
                    <span className="text-sm">
                      {new Date(
                        verification.userCreatedAt
                      ).toLocaleDateString()}
                    </span>
                  </div>
                </div>
                <div className="mt-4">
                  <p className="text-sm text-gray-500 mb-2">
                    Document d'identité:
                  </p>
                  <VerificationImage
                    document={verification.document}
                    onClick={() => openImageDialog(verification.document)}
                  />
                </div>
              </CardContent>
              <CardFooter className="flex justify-between">
                <Button
                  variant="outline"
                  className="w-[48%] border-red-200 text-red-500 hover:bg-red-50 hover:text-red-600"
                  onClick={() => handleReject(verification.id)}
                >
                  <XCircle className="mr-2 h-4 w-4" />
                  Refuser
                </Button>
                <Button
                  className="w-[48%] bg-green-600 text-white hover:bg-green-700"
                  onClick={() => handleApprove(verification.id)}
                >
                  <CheckCircle className="mr-2 h-4 w-4" />
                  Valider
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      )}

      <Dialog open={openDialog} onOpenChange={setOpenDialog}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>Document d'identité</DialogTitle>
            <DialogDescription>
              Vérifiez attentivement le document d'identité avant de valider la
              demande.
            </DialogDescription>
          </DialogHeader>
          <div className="flex flex-col items-center justify-center p-2">
            <div className="bg-gray-100 p-4 rounded-md mb-4 w-full text-center">
              <p className="text-sm font-medium">
                Nom du fichier: {selectedDocument}
              </p>
            </div>
            <div className="border rounded-md p-4 bg-gray-50 w-full flex items-center justify-center min-h-[300px]">
              <FileImage className="h-16 w-16 text-gray-400" />
            </div>
            <p className="text-sm text-gray-500 mt-4">
              Note: Dans un environnement de production, l'image réelle du
              document serait affichée ici.
            </p>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
