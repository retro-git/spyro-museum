import { Moon, Sun } from "lucide-react"
 
import { Button } from "./ui/button"
import { useTheme } from "./theme-provider"

export function ModeToggle() {
  const { theme, setTheme } = useTheme()
 
  const toggleTheme = () => {
    if (theme === "light") {
      setTheme("dark")
    } else {
      setTheme("light")
    }
  }

  const getIcon = () => {
    if (theme === "light") {
      return <Sun className="h-4 w-4" />
    } else {
      return <Moon className="h-4 w-4" />
    }
  }
 
  return (
    <Button
      variant="ghost"
      size="sm"
      className="h-8 w-8 p-0 bg-transparent hover:bg-secondary/80 text-muted-foreground"
      onClick={toggleTheme}
      title={`Current theme: ${theme}. Click to toggle between light and dark.`}
    >
      {getIcon()}
    </Button>
  )
}
