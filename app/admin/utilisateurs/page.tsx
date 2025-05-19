"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { Trash, Plus, Pencil } from "lucide-react"
import { getUsers, deleteUser } from "@/lib/actions"
import { useToast } from "@/hooks/use-toast"

// Fonction pour convertir le statut de vérification en texte
const getVerificationStatus = (status) => {
  switch (status) {
    case "0":
      return { label: "Non vérifié", variant: "destructive" }
    case "1":
      return { label: "Vérifié", variant: "default" }
    case "2":
      return { label: "En attente", variant: "outline" }
    default:
      return { label: "Inconnu", variant: "outline" }
  }
}

export default function UtilisateursPage() {
  const [utilisateurs, setUtilisateurs] = useState([])
  const [dialogOpen, setDialogOpen] = useState(false)
  const [utilisateurToDelete, setUtilisateurToDelete] = useState(null)
  const [loading, setLoading] = useState(true)
  const { toast } = useToast()

  useEffect(() => {
    async function fetchUtilisateurs() {
      try {
        const result = await getUsers()
        if (result.success) {
          setUtilisateurs(result.data)
        } else {
          toast({
            title: "Erreur",
            description: result.error || "Impossible de charger les utilisateurs",
            variant: "destructive",
          })
        }
      } catch (error) {
        toast({
          title: "Erreur",
          description: "Impossible de charger les utilisateurs",
          variant: "destructive",
        })
      } finally {
        setLoading(false)
      }
    }

    fetchUtilisateurs()
  }, [toast])

  const handleDeleteClick = (id) => {
    setUtilisateurToDelete(id)
    setDialogOpen(true)
  }

  const confirmDelete = async () => {
    if (utilisateurToDelete) {
      try {
        const result = await deleteUser(utilisateurToDelete)
        if (result.success) {
          setUtilisateurs(utilisateurs.filter((user) => user.id !== utilisateurToDelete))
          toast({
            title: "Succès",
            description: "Utilisateur supprimé avec succès",
          })
        } else {
          toast({
            title: "Erreur",
            description: result.error || "Impossible de supprimer l'utilisateur",
            variant: "destructive",
          })
        }
      } catch (error) {
        toast({
          title: "Erreur",
          description: "Impossible de supprimer l'utilisateur",
          variant: "destructive",
        })
      } finally {
        setDialogOpen(false)
        setUtilisateurToDelete(null)
      }
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Gestion des Utilisateurs</h1>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          Ajouter un utilisateur
        </Button>
      </div>

      {loading ? (
        <div className="flex h-40 items-center justify-center">
          <p>Chargement des utilisateurs...</p>
        </div>
      ) : (
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Utilisateur</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Téléphone</TableHead>
                <TableHead>Rôle</TableHead>
                <TableHead>Statut</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {utilisateurs.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="h-24 text-center">
                    Aucun utilisateur trouvé
                  </TableCell>
                </TableRow>
              ) : (
                utilisateurs.map((user) => {
                  const status = getVerificationStatus(user.verificationStatus)
                  return (
                    <TableRow key={user.id}>
                      <TableCell className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center">
                          <span className="text-sm font-medium">
                            {user.firstName.charAt(0)}
                            {user.lastName.charAt(0)}
                          </span>
                        </div>
                        <span className="font-medium">
                          {user.firstName} {user.lastName}
                        </span>
                      </TableCell>
                      <TableCell>{user.email}</TableCell>
                      <TableCell>{user.phone}</TableCell>
                      <TableCell>{user.role}</TableCell>
                      <TableCell>
                        <Badge variant={status.variant}>{status.label}</Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button variant="ghost" size="icon">
                            <Pencil className="h-4 w-4" />
                            <span className="sr-only">Modifier</span>
                          </Button>
                          <Button variant="ghost" size="icon" onClick={() => handleDeleteClick(user.id)}>
                            <Trash className="h-4 w-4 text-red-500" />
                            <span className="sr-only">Supprimer</span>
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  )
                })
              )}
            </TableBody>
          </Table>
        </div>
      )}

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirmer la suppression</DialogTitle>
            <DialogDescription>
              Êtes-vous sûr de vouloir supprimer cet utilisateur ? Cette action est irréversible.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>
              Annuler
            </Button>
            <Button variant="destructive" onClick={confirmDelete}>
              Supprimer
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
