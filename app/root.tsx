import { useState, useEffect } from 'react'
import {
  isRouteErrorResponse,
  Links,
  Meta,
  NavLink,
  Outlet,
  Scripts,
  ScrollRestoration,
  useNavigate,
  useLocation,
} from 'react-router'

import type { Route } from './+types/root'
import { ToastContext, useToastState } from '~/hooks/useToast'
import { getToken, clearToken } from '~/api/client'
import './app.css'

// ---------------------------------------------------------------------------
// Google Fonts
// ---------------------------------------------------------------------------

export const links: Route.LinksFunction = () => [
  { rel: 'preconnect', href: 'https://fonts.googleapis.com' },
  {
    rel: 'preconnect',
    href: 'https://fonts.gstatic.com',
    crossOrigin: 'anonymous',
  },
  {
    rel: 'stylesheet',
    href: 'https://fonts.googleapis.com/css2?family=Inter:ital,opsz,wght@0,14..32,100..900;1,14..32,100..900&display=swap',
  },
]

// ---------------------------------------------------------------------------
// Nav items
// ---------------------------------------------------------------------------

const NAV_ITEMS = [
  { label: 'Dictionary', to: '/vocabulary' },
  { label: 'Study Sets', to: '/groups' },
] as const

// ---------------------------------------------------------------------------
// HTML shell — Layout wraps the entire <html> document.
// Do NOT put React context providers here; use App() instead.
// ---------------------------------------------------------------------------

export function Layout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <Meta />
        <Links />
      </head>
      <body>
        {children}
        <ScrollRestoration />
        <Scripts />
      </body>
    </html>
  )
}

// ---------------------------------------------------------------------------
// Toast UI — rendered inside App so it can access ToastContext
// ---------------------------------------------------------------------------

function ToastList() {
  const ctx = useToastState()
  // This component is only used to render the toast overlay;
  // The provider + state live in App and are passed via context.
  // We read from context directly here.
  return null
}

// ---------------------------------------------------------------------------
// Top navigation bar
// ---------------------------------------------------------------------------

function TopNav() {
  const [menuOpen, setMenuOpen] = useState(false)
  const navigate = useNavigate()

  function handleLogout() {
    clearToken()
    navigate('/login', { replace: true })
  }

  const navLinkClass = ({ isActive }: { isActive: boolean }) =>
    [
      'px-3 py-2 rounded-md text-sm font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-offset-1',
      isActive
        ? 'bg-blue-600 text-white'
        : 'text-gray-700 hover:bg-gray-100 hover:text-gray-900',
    ].join(' ')

  const mobileNavLinkClass = ({ isActive }: { isActive: boolean }) =>
    [
      'block rounded-md px-3 py-2 text-base font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-blue-400',
      isActive
        ? 'bg-blue-600 text-white'
        : 'text-gray-700 hover:bg-gray-100 hover:text-gray-900',
    ].join(' ')

  return (
    <nav
      className="sticky top-0 z-40 border-b border-gray-200 bg-white shadow-sm"
      aria-label="Main navigation"
    >
      <div className="mx-auto max-w-6xl px-4">
        <div className="flex h-14 items-center justify-between">
          {/* Brand */}
          <NavLink
            to="/"
            className="text-lg font-bold text-blue-600 hover:text-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-offset-1 rounded"
            aria-label="Band Pilot home"
          >
            Band Pilot
          </NavLink>

          {/* Desktop nav links */}
          <div className="hidden items-center gap-1 md:flex" role="menubar">
            {NAV_ITEMS.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                className={navLinkClass}
                role="menuitem"
              >
                {item.label}
              </NavLink>
            ))}
            <button
              type="button"
              onClick={handleLogout}
              className="ml-2 px-3 py-2 rounded-md text-sm font-medium text-gray-500 hover:bg-gray-100 hover:text-gray-700 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-offset-1"
            >
              Sign out
            </button>
          </div>

          {/* Mobile hamburger button */}
          <button
            type="button"
            className="inline-flex items-center justify-center rounded-md p-2 text-gray-600 hover:bg-gray-100 hover:text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-400 md:hidden"
            aria-controls="mobile-menu"
            aria-expanded={menuOpen}
            aria-label="Toggle navigation menu"
            onClick={() => setMenuOpen((prev) => !prev)}
          >
            {menuOpen ? (
              /* X icon */
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
                aria-hidden="true"
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            ) : (
              /* Hamburger icon */
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
                aria-hidden="true"
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            )}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {menuOpen && (
        <div id="mobile-menu" className="border-t border-gray-100 bg-white px-4 py-3 md:hidden">
          <div className="space-y-1" role="menu" aria-label="Mobile navigation">
            {NAV_ITEMS.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                className={mobileNavLinkClass}
                role="menuitem"
                onClick={() => setMenuOpen(false)}
              >
                {item.label}
              </NavLink>
            ))}
          </div>
        </div>
      )}
    </nav>
  )
}

// ---------------------------------------------------------------------------
// Toast overlay component — lives inside ToastContext.Provider
// ---------------------------------------------------------------------------

function ToastOverlay() {
  // Read from context via the ToastContext directly so we don't need
  // to thread props through App
  return null // Implemented inline in App below, see ToastRegion
}

// ---------------------------------------------------------------------------
// App — default export.
// Context providers go here, NOT in Layout.
// ---------------------------------------------------------------------------

export default function App() {
  const toastState = useToastState()
  const navigate = useNavigate()
  const location = useLocation()

  const isLoginPage = location.pathname === '/login'

  // Protect all routes except /login
  useEffect(() => {
    if (!isLoginPage && !getToken()) {
      navigate('/login', { replace: true })
    }
  }, [location.pathname, navigate, isLoginPage])

  // Login page renders without nav/shell
  if (isLoginPage) {
    return (
      <ToastContext.Provider value={toastState}>
        <Outlet />
      </ToastContext.Provider>
    )
  }

  return (
    <ToastContext.Provider value={toastState}>
      {/* Full-page layout */}
      <div className="flex min-h-screen flex-col bg-gray-50">
        <TopNav />

        {/* Page content */}
        <main className="flex-1">
          <div className="mx-auto max-w-6xl px-4 py-6">
            <Outlet />
          </div>
        </main>
      </div>

      {/* Toast region — fixed bottom-right */}
      <ToastRegion toasts={toastState.toasts} dismiss={toastState.dismissToast} />
    </ToastContext.Provider>
  )
}

// ---------------------------------------------------------------------------
// ToastRegion — renders active toasts
// ---------------------------------------------------------------------------

interface ToastItem {
  id: number
  message: string
}

function ToastRegion({
  toasts,
  dismiss,
}: {
  toasts: ToastItem[]
  dismiss: (id: number) => void
}) {
  if (toasts.length === 0) return null

  return (
    <div
      aria-live="assertive"
      aria-atomic="false"
      className="pointer-events-none fixed bottom-4 right-4 z-50 flex flex-col gap-3"
      role="region"
      aria-label="Notifications"
    >
      {toasts.map((toast) => (
        <div
          key={toast.id}
          role="alert"
          className="pointer-events-auto flex w-80 max-w-full items-start gap-3 rounded-lg border border-red-200 bg-red-50 px-4 py-3 shadow-lg"
        >
          {/* Error icon */}
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="mt-0.5 h-5 w-5 shrink-0 text-red-500"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
            aria-hidden="true"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M12 9v2m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"
            />
          </svg>

          {/* Message */}
          <p className="flex-1 text-sm text-red-700">{toast.message}</p>

          {/* Dismiss button */}
          <button
            type="button"
            onClick={() => dismiss(toast.id)}
            aria-label="Dismiss notification"
            className="shrink-0 rounded text-red-400 hover:text-red-600 focus:outline-none focus:ring-2 focus:ring-red-400"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-4 w-4"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
              aria-hidden="true"
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      ))}
    </div>
  )
}

// ---------------------------------------------------------------------------
// Error boundary — catches route-level errors
// ---------------------------------------------------------------------------

export function ErrorBoundary({ error }: Route.ErrorBoundaryProps) {
  let message = 'Oops!'
  let details = 'An unexpected error occurred.'
  let stack: string | undefined

  if (isRouteErrorResponse(error)) {
    message = error.status === 404 ? '404' : 'Error'
    details =
      error.status === 404
        ? 'The requested page could not be found.'
        : error.statusText || details
  } else if (import.meta.env.DEV && error && error instanceof Error) {
    details = error.message
    stack = error.stack
  }

  return (
    <main className="container mx-auto p-4 pt-16">
      <h1 className="text-2xl font-bold text-gray-900">{message}</h1>
      <p className="mt-2 text-gray-600">{details}</p>
      {stack && (
        <pre className="mt-4 w-full overflow-x-auto rounded-md bg-gray-100 p-4 text-xs">
          <code>{stack}</code>
        </pre>
      )}
    </main>
  )
}
