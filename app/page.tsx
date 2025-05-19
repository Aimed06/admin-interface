import { redirect } from "next/navigation"

export default function Home() {
  // Rediriger vers le dashboard admin
  redirect("/admin")

  return null
}
