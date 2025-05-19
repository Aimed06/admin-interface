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
import { Trash, Plus, Pencil } from "lucide-react"
import Image from "next/image"
import { getProducts, deleteProduct } from "@/lib/actions"
import { useToast } from "@/hooks/use-toast"

export default function ProduitsPage() {
  const [produits, setProduits] = useState([])
  const [dialogOpen, setDialogOpen] = useState(false)
  const [produitToDelete, setProduitToDelete] = useState(null)
  const [loading, setLoading] = useState(true)
  const { toast } = useToast()

  useEffect(() => {
    async function fetchProduits() {
      try {
        const result = await getProducts()
        if (result.success) {
          setProduits(result.data)
        } else {
          toast({
            title: "Erreur",
            description: result.error || "Impossible de charger les produits",
            variant: "destructive",
          })
        }
      } catch (error) {
        toast({
          title: "Erreur",
          description: "Impossible de charger les produits",
          variant: "destructive",
        })
      } finally {
        setLoading(false)
      }
    }

    fetchProduits()
  }, [toast])

  const handleDeleteClick = (id) => {
    setProduitToDelete(id)
    setDialogOpen(true)
  }

  const confirmDelete = async () => {
    if (produitToDelete) {
      try {
        const result = await deleteProduct(produitToDelete)
        if (result.success) {
          setProduits(produits.filter((produit) => produit.id !== produitToDelete))
          toast({
            title: "Succès",
            description: "Produit supprimé avec succès",
          })
        } else {
          toast({
            title: "Erreur",
            description: result.error || "Impossible de supprimer le produit",
            variant: "destructive",
          })
        }
      } catch (error) {
        toast({
          title: "Erreur",
          description: "Impossible de supprimer le produit",
          variant: "destructive",
        })
      } finally {
        setDialogOpen(false)
        setProduitToDelete(null)
      }
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Gestion des Produits</h1>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          Ajouter un produit
        </Button>
      </div>

      {loading ? (
        <div className="flex h-40 items-center justify-center">
          <p>Chargement des produits...</p>
        </div>
      ) : (
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Image</TableHead>
                <TableHead>Nom</TableHead>
                <TableHead>Prix</TableHead>
                <TableHead>Catégorie</TableHead>
                <TableHead>Vendeur</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {produits.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="h-24 text-center">
                    Aucun produit trouvé
                  </TableCell>
                </TableRow>
              ) : (
                produits.map((produit) => (
                  <TableRow key={produit.id}>
                    <TableCell>
                      <Image
                        src={produit.image || "/placeholder.svg"}
                        alt={produit.name}
                        width={50}
                        height={50}
                        className="rounded-md"
                      />
                    </TableCell>
                    <TableCell className="font-medium">{produit.name}</TableCell>
                    <TableCell>{produit.price} €</TableCell>
                    <TableCell>{produit.categoryName || "Non catégorisé"}</TableCell>
                    <TableCell>{produit.sellerName || "Inconnu"}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button variant="ghost" size="icon">
                          <Pencil className="h-4 w-4" />
                          <span className="sr-only">Modifier</span>
                        </Button>
                        <Button variant="ghost" size="icon" onClick={() => handleDeleteClick(produit.id)}>
                          <Trash className="h-4 w-4 text-red-500" />
                          <span className="sr-only">Supprimer</span>
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
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
              Êtes-vous sûr de vouloir supprimer ce produit ? Cette action est irréversible.
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
