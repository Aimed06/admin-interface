"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { useToast } from "@/hooks/use-toast"

export default function AjouterUtilisateurPage() {
  const [prenom, setPrenom] = useState("")
  const [nom, setNom] = useState("")
  const [email, setEmail] = useState("")
  const [telephone, setTelephone] = useState("")
  const [role, setRole] = useState("CLIENT")
  const [loading, setLoading] = useState(false)
  const router = useRouter()
  const { toast } = useToast()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!prenom || !nom || !email || !telephone) {
      toast({
        title: "Erreur",
        description: "Veuillez remplir tous les champs",
        variant: "destructive",
      })
      return
    }

    setLoading(true)

    try {
      const response = await fetch("/api/users", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          firstName: prenom,
          lastName: nom,
          email,
          phone: telephone,
          role,
        }),
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || "Erreur lors de l'ajout de l'utilisateur")
      }

      toast({
        title: "Succès",
        description: "Utilisateur ajouté avec succès",
      })

      router.push("/admin/utilisateurs")
    } catch (error) {
      toast({
        title: "Erreur",
        description: error instanceof Error ? error.message : "Impossible d'ajouter l'utilisateur",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Ajouter un utilisateur</h1>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Informations de l'utilisateur</CardTitle>
          <CardDescription>Ajoutez les détails du nouvel utilisateur.</CardDescription>
        </CardHeader>
        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="prenom">Prénom</Label>
                <Input
                  id="prenom"
                  value={prenom}
                  onChange={(e) => setPrenom(e.target.value)}
                  placeholder="Jean"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="nom">Nom</Label>
                <Input id="nom" value={nom} onChange={(e) => setNom(e.target.value)} placeholder="Dupont" required />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="jean.dupont@exemple.fr"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="telephone">Téléphone</Label>
              <Input
                id="telephone"
                value={telephone}
                onChange={(e) => setTelephone(e.target.value)}
                placeholder="0612345678"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="role">Rôle</Label>
              <Select value={role} onValueChange={setRole}>
                <SelectTrigger>
                  <SelectValue placeholder="Sélectionner un rôle" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="CLIENT">Client</SelectItem>
                  <SelectItem value="VENDOR">Vendeur</SelectItem>
                  <SelectItem value="BOTH">Les deux</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
          <CardFooter className="flex justify-between">
            <Button type="button" variant="outline" onClick={() => router.push("/admin/utilisateurs")}>
              Annuler
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? "Ajout en cours..." : "Ajouter l'utilisateur"}
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  )
}
