"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { getCategories } from "@/lib/actions"
import { useToast } from "@/hooks/use-toast"

export default function AjouterProduitPage() {
  const [nom, setNom] = useState("")
  const [prix, setPrix] = useState("")
  const [categorie, setCategorie] = useState("")
  const [image, setImage] = useState<File | null>(null)
  const [imagePreview, setImagePreview] = useState<string | null>(null)
  const [categories, setCategories] = useState([])
  const [loading, setLoading] = useState(false)
  const [loadingCategories, setLoadingCategories] = useState(true)
  const router = useRouter()
  const { toast } = useToast()

  useEffect(() => {
    async function fetchCategories() {
      try {
        const result = await getCategories()
        if (result.success) {
          setCategories(result.data)
        } else {
          toast({
            title: "Erreur",
            description: result.error || "Impossible de charger les catégories",
            variant: "destructive",
          })
        }
      } catch (error) {
        toast({
          title: "Erreur",
          description: "Impossible de charger les catégories",
          variant: "destructive",
        })
      } finally {
        setLoadingCategories(false)
      }
    }

    fetchCategories()
  }, [toast])

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0]
      setImage(file)

      // Créer un aperçu de l'image
      const reader = new FileReader()
      reader.onload = (event) => {
        setImagePreview(event.target?.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!nom || !prix || !categorie || !image) {
      toast({
        title: "Erreur",
        description: "Veuillez remplir tous les champs",
        variant: "destructive",
      })
      return
    }

    setLoading(true)

    try {
      const formData = new FormData()
      formData.append("name", nom)
      formData.append("price", prix)
      formData.append("categoryId", categorie)
      formData.append("sellerId", "1") // ID du vendeur par défaut (à remplacer par l'ID de l'utilisateur connecté)
      formData.append("image", image)

      const response = await fetch("/api/products", {
        method: "POST",
        body: formData,
      })

      if (!response.ok) {
        throw new Error("Erreur lors de l'ajout du produit")
      }

      toast({
        title: "Succès",
        description: "Produit ajouté avec succès",
      })

      router.push("/admin/produits")
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Impossible d'ajouter le produit",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Ajouter un produit</h1>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Informations du produit</CardTitle>
          <CardDescription>Ajoutez les détails du nouveau produit à mettre en vente.</CardDescription>
        </CardHeader>
        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="nom">Nom du produit</Label>
              <Input
                id="nom"
                value={nom}
                onChange={(e) => setNom(e.target.value)}
                placeholder="T-shirt Vintage"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="prix">Prix (€)</Label>
              <Input
                id="prix"
                type="number"
                step="0.01"
                value={prix}
                onChange={(e) => setPrix(e.target.value)}
                placeholder="19.99"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="categorie">Catégorie</Label>
              {loadingCategories ? (
                <Select disabled>
                  <SelectTrigger>
                    <SelectValue placeholder="Chargement des catégories..." />
                  </SelectTrigger>
                </Select>
              ) : (
                <Select value={categorie} onValueChange={setCategorie} required>
                  <SelectTrigger>
                    <SelectValue placeholder="Sélectionner une catégorie" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((cat) => (
                      <SelectItem key={cat.id} value={cat.id}>
                        {cat.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="image">Image du produit</Label>
              <Input id="image" type="file" accept="image/*" onChange={handleImageChange} required />

              {imagePreview && (
                <div className="mt-2">
                  <p className="text-sm text-gray-500 mb-2">Aperçu :</p>
                  <img
                    src={imagePreview || "/placeholder.svg"}
                    alt="Aperçu"
                    className="h-40 w-auto object-contain rounded-md border"
                  />
                </div>
              )}
            </div>
          </CardContent>
          <CardFooter className="flex justify-between">
            <Button type="button" variant="outline" onClick={() => router.push("/admin/produits")}>
              Annuler
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? "Ajout en cours..." : "Ajouter le produit"}
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  )
}
