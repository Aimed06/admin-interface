"use client"

import type React from "react"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { BarChart3, Package, ShoppingBag, Users } from "lucide-react"
import { cn } from "@/lib/utils"

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const pathname = usePathname()

  const navigation = [
    { name: "Dashboard", href: "/admin", icon: BarChart3 },
    { name: "Produits", href: "/admin/produits", icon: ShoppingBag },
    { name: "Utilisateurs", href: "/admin/utilisateurs", icon: Users },
    { name: "Vérifications", href: "/admin/verifications", icon: Package },
  ]

  return (
    <div className="flex min-h-screen">
      {/* Sidebar */}
      <div className="hidden w-64 flex-col bg-gray-50 dark:bg-gray-900 md:flex">
        <div className="flex h-16 items-center border-b px-6">
          <Link href="/admin" className="flex items-center gap-2 font-semibold">
            <ShoppingBag className="h-6 w-6" />
            <span>Admin Fripes</span>
          </Link>
        </div>
        <nav className="flex-1 space-y-1 px-2 py-4">
          {navigation.map((item) => (
            <Link
              key={item.name}
              href={item.href}
              className={cn(
                "group flex items-center rounded-md px-3 py-2 text-sm font-medium",
                pathname === item.href
                  ? "bg-gray-200 text-gray-900 dark:bg-gray-800 dark:text-white"
                  : "text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800",
              )}
            >
              <item.icon
                className={cn(
                  "mr-3 h-5 w-5",
                  pathname === item.href ? "text-gray-900 dark:text-white" : "text-gray-500 dark:text-gray-400",
                )}
              />
              {item.name}
            </Link>
          ))}
        </nav>
      </div>

      {/* Mobile header */}
      <div className="flex flex-1 flex-col">
        <div className="border-b md:hidden">
          <div className="flex h-16 items-center px-4">
            <Link href="/admin" className="flex items-center gap-2 font-semibold">
              <ShoppingBag className="h-6 w-6" />
              <span>Admin Fripes</span>
            </Link>
          </div>
        </div>

        {/* Main content */}
        <main className="flex-1 p-6">{children}</main>
      </div>
    </div>
  )
}
