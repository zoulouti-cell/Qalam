import type { ReactNode } from "react";
import { Navigate, Outlet, Route, Routes, useLocation } from "react-router-dom";
import { Toaster } from "@/components/ui/sonner";
import AppLayout from "@/components/AppLayout";
import { useMe } from "@/lib/hooks";
import { I18nProvider } from "@/lib/i18n";
import AuthCallback from "@/pages/AuthCallback";
import Login from "@/pages/Login";
import Dashboard from "@/pages/Dashboard";
import Clients from "@/pages/Clients";
import ClientDetail from "@/pages/ClientDetail";
import Cases from "@/pages/Cases";
import CaseDetail from "@/pages/CaseDetail";
import CalendarPage from "@/pages/Calendar";
import Documents from "@/pages/Documents";
import DocumentEditor from "@/pages/DocumentEditor";
import Library from "@/pages/Library";
import Assistant from "@/pages/Assistant";
import Team from "@/pages/Team";

function Protected() {
  const me = useMe();
  if (me.isPending)
    return (
      <div className="grid min-h-screen place-items-center text-muted-foreground" data-testid="auth-loading">
        <div className="size-8 animate-spin rounded-full border-2 border-terra border-t-transparent" />
      </div>
    );
  if (me.isError || !me.data) return <Navigate to="/login" replace />;
  return (
    <AppLayout user={me.data}>
      <Outlet />
    </AppLayout>
  );
}

function AdminOnly({ children }: { children: ReactNode }) {
  const me = useMe();
  return me.data?.role === "admin" ? <>{children}</> : <Navigate to="/" replace />;
}

function AppRouter() {
  const location = useLocation();
  // Detect the OAuth fragment synchronously during render (before any auth check runs).
  if (location.hash?.includes("session_id=")) return <AuthCallback />;
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route element={<Protected />}>
        <Route path="/" element={<Dashboard />} />
        <Route path="/clients" element={<Clients />} />
        <Route path="/clients/:id" element={<ClientDetail />} />
        <Route path="/cases" element={<Cases />} />
        <Route path="/cases/:id" element={<CaseDetail />} />
        <Route path="/calendar" element={<CalendarPage />} />
        <Route path="/documents" element={<Documents />} />
        <Route path="/documents/:id" element={<DocumentEditor />} />
        <Route path="/library" element={<Library />} />
        <Route path="/assistant" element={<Assistant />} />
        <Route path="/team" element={<AdminOnly><Team /></AdminOnly>} />
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default function App() {
  return (
    <I18nProvider>
      <AppRouter />
      <Toaster richColors />
    </I18nProvider>
  );
}
