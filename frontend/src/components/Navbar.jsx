import { BookOpen, Code2, Home, LogIn, LogOut, PanelLeft, UserPlus } from "lucide-react";
import Button from "./Button.jsx";

export default function Navbar({ auth, currentPage, onLogout, onNavigate }) {
  const userEmail = auth?.user?.email;

  return (
    <header className="border-b border-zinc-200 bg-white">
      <div className="mx-auto flex max-w-7xl flex-col gap-4 px-4 py-4 sm:flex-row sm:items-center sm:justify-between lg:px-6">
        <button
          type="button"
          onClick={() => onNavigate("practice")}
          className="focus-ring inline-flex w-fit items-center gap-3 rounded-lg text-left"
        >
          <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-teal-700 text-white">
            <Code2 aria-hidden="true" className="h-5 w-5" />
          </span>
          <span>
            <span className="block text-sm font-semibold text-zinc-950">Code Practice Assistant</span>
            <span className="block text-xs text-zinc-500">Frontend MVP</span>
          </span>
        </button>

        <nav className="flex flex-wrap items-center gap-2" aria-label="Main navigation">
          <Button
            icon={PanelLeft}
            variant={currentPage === "practice" ? "primary" : "secondary"}
            onClick={() => onNavigate("practice")}
          >
            Practice
          </Button>
          <Button
            icon={Home}
            variant={currentPage === "home" ? "primary" : "ghost"}
            onClick={() => onNavigate("home")}
          >
            Home
          </Button>
          {auth ? (
            <Button
              icon={BookOpen}
              variant={currentPage === "snippets" ? "primary" : "secondary"}
              onClick={() => onNavigate("snippets")}
            >
              Saved
            </Button>
          ) : null}
          {!auth ? (
            <>
              <Button
                icon={LogIn}
                variant={currentPage === "login" ? "primary" : "secondary"}
                onClick={() => onNavigate("login")}
              >
                Login
              </Button>
              <Button
                icon={UserPlus}
                variant={currentPage === "signup" ? "primary" : "ghost"}
                onClick={() => onNavigate("signup")}
              >
                Signup
              </Button>
            </>
          ) : (
            <div className="flex flex-wrap items-center gap-2">
              <span className="max-w-[180px] truncate text-xs font-medium text-zinc-500">{userEmail}</span>
              <Button icon={LogOut} variant="ghost" onClick={onLogout}>
                Logout
              </Button>
            </div>
          )}
        </nav>
      </div>
    </header>
  );
}
