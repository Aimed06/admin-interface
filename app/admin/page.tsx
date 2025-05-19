"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ShoppingBag, Users, CheckCircle, AlertCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export default function AdminDashboard() {
  const [stats, setStats] = useState([
    {
      name: "Total Produits",
      value: "...",
      icon: ShoppingBag,
      description: "Produits en stock",
    },
    {
      name: "Total Utilisateurs",
      value: "...",
      icon: Users,
      description: "Utilisateurs inscrits",
    },
    {
      name: "Utilisateurs vérifiés",
      value: "...",
      icon: CheckCircle,
      description: "Comptes vérifiés",
    },
    {
      name: "En attente de vérification",
      value: "...",
      icon: AlertCircle,
      description: "Utilisateurs à vérifier",
    },
  ]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    async function fetchStats() {
      try {
        // Récupérer les statistiques depuis le serveur
        const response = await fetch("/api/dashboard/stats");
        if (!response.ok) {
          throw new Error("Erreur lors de la récupération des statistiques");
        }

        const data = await response.json();

        // Mettre à jour les statistiques
        setStats([
          {
            name: "Total Produits",
            value: data.totalProducts.toString(),
            icon: ShoppingBag,
            description: "Produits en stock",
          },
          {
            name: "Total Utilisateurs",
            value: data.totalUsers.toString(),
            icon: Users,
            description: "Utilisateurs inscrits",
          },
          {
            name: "Utilisateurs vérifiés",
            value: data.verifiedUsers.toString(),
            icon: CheckCircle,
            description: "Comptes vérifiés",
          },
          {
            name: "En attente de vérification",
            value: data.pendingVerifications.toString(),
            icon: AlertCircle,
            description: "Utilisateurs à vérifier",
          },
        ]);
      } catch (error) {
        toast({
          title: "Erreur",
          description: "Impossible de charger les statistiques",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    }

    fetchStats();
  }, [toast]);

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Tableau de bord</h1>

      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <Card key={stat.name}>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">{stat.name}</CardTitle>
              <stat.icon className="h-5 w-5 text-gray-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {loading ? "..." : stat.value}
              </div>
              <p className="text-sm text-gray-500">{stat.description}</p>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
