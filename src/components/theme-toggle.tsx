"use client"

import { useEffect, useState } from "react"
import { Moon, Sun } from "lucide-react"

import { Button } from "./ui/button"

export function ThemeToggle() {
  const [theme, setTheme] = useState<"light" | "dark">("light")

  useEffect(() => {
    const savedTheme = localStorage.getItem("theme") as "light" | "dark" | null
    const prefersDark = window.matchMedia(
      "(prefers-color-scheme: dark)",
    ).matches
    const initialTheme = savedTheme ?? (prefersDark ? "dark" : "light")

    // eslint-disable-next-line react-hooks/set-state-in-effect
    setTheme(initialTheme)
    document.documentElement.classList.toggle("dark", initialTheme === "dark")
  }, [])

  const toggleTheme = () => {
    const newTheme = theme === "light" ? "dark" : "light"
    setTheme(newTheme)
    localStorage.setItem("theme", newTheme)
    document.documentElement.classList.toggle("dark", newTheme === "dark")
  }

  return (
    <Button
      onClick={toggleTheme}
      variant={"outline"}
      size={"icon"}
      aria-label="Toggle theme"
    >
      {theme === "light" ? <Moon /> : <Sun />}
    </Button>
  )
}
