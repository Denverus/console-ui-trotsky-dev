import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider } from '@/contexts/AuthContext'
import { ProtectedRoute } from '@/components/ProtectedRoute'
import { Layout } from '@/components/Layout'
import { Landing } from '@/pages/Landing'
import { Login } from '@/pages/Login'
import { Register } from '@/pages/Register'
import { Dashboard } from '@/pages/Dashboard'
import { Analytics } from '@/pages/Analytics'
import { Companies } from '@/pages/Companies'
import { CompanyDetail } from '@/pages/CompanyDetail'
import { Users } from '@/pages/Users'
import { UserDetail } from '@/pages/UserDetail'
import { Configuration } from '@/pages/Configuration'
import { Docs } from '@/pages/Docs'
import { DocsAnalytics } from '@/pages/DocsAnalytics'
import { DocsServiceStub } from '@/pages/DocsServiceStub'
import { SuperAdminRoute } from '@/components/SuperAdminRoute'

export function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route
            path="/app"
            element={
              <ProtectedRoute>
                <Layout />
              </ProtectedRoute>
            }
          >
            <Route index element={<Dashboard />} />
            <Route path="analytics" element={<Analytics />} />
            <Route path="companies" element={<Companies />} />
            <Route path="companies/:id" element={<CompanyDetail />} />
            <Route path="users" element={<Users />} />
            <Route path="users/:id" element={<UserDetail />} />
            <Route path="docs" element={<Docs />} />
            <Route path="docs/analytics" element={<DocsAnalytics />} />
            <Route path="docs/payments" element={<DocsServiceStub serviceId="payments" />} />
            <Route path="docs/email" element={<DocsServiceStub serviceId="email" />} />
            <Route path="docs/logs" element={<DocsServiceStub serviceId="logs" />} />
            <Route
              path="configuration"
              element={
                <SuperAdminRoute>
                  <Configuration />
                </SuperAdminRoute>
              }
            />
          </Route>
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  )
}
