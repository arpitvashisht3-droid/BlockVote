import { Navigate, Route, Routes } from 'react-router-dom'
import { DemoAuthProvider } from './context/DemoAuthContext'
import { ProtectedRoute } from './components/ProtectedRoute'
import { DashboardLayout } from './layouts/DashboardLayout'
import { PublicLayout } from './layouts/PublicLayout'

import { SignInPage } from './pages/SignInPage'
import { CreateAccountPage } from './pages/CreateAccountPage'

import { AdminDashboardPage } from './pages/AdminDashboardPage'
import { AdminElectionsPage } from './pages/AdminElectionsPage'
import { AdminPlaceholderPage } from './pages/AdminPlaceholderPage'
import { AdminResultsPage } from './pages/AdminResultsPage'
import { BlockchainVerificationPage } from './pages/BlockchainVerificationPage'
import { CandidateManagementPage } from './pages/CandidateManagementPage'
import { CreateElectionPage } from './pages/CreateElectionPage'
import { DashboardPlaceholderPage } from './pages/DashboardPlaceholderPage'
import { ElectionDetailsPage } from './pages/ElectionDetailsPage'
import { ElectionResultsPage } from './pages/ElectionResultsPage'
import { ElectionsPage } from './pages/ElectionsPage'
import { HomePage } from './pages/HomePage'
import { ManageElectionPage } from './pages/ManageElectionPage'
import { VoteSuccessPage } from './pages/VoteSuccessPage'
import { VoterDashboardPage } from './pages/VoterDashboardPage'

export default function App() {
  return (
    <DemoAuthProvider>
      <Routes>
        {/* Frontend-only Demo Auth Routes */}
        <Route path="/signin" element={<SignInPage />} />
        <Route path="/create-account" element={<CreateAccountPage />} />

        {/* Demo Admin Dashboard Routes */}
        <Route element={<ProtectedRoute requiredRole="admin" />}>
          <Route element={<DashboardLayout variant="admin" />}>
            <Route path="/admin" element={<AdminDashboardPage />} />
            <Route path="/admin/elections" element={<AdminElectionsPage />} />
            <Route
              path="/admin/elections/create"
              element={<CreateElectionPage />}
            />
            <Route path="/admin/elections/:id" element={<ManageElectionPage />} />
            <Route path="/admin/candidates" element={<CandidateManagementPage />} />
            <Route path="/admin/results" element={<AdminResultsPage />} />
            <Route path="/admin/transactions" element={<AdminPlaceholderPage />} />
          </Route>
        </Route>

        {/* Demo Voter Dashboard Routes */}
        <Route element={<ProtectedRoute requiredRole="voter" />}>
          <Route element={<DashboardLayout variant="voter" />}>
            <Route path="/dashboard" element={<VoterDashboardPage />} />
            <Route path="/dashboard/votes" element={<DashboardPlaceholderPage />} />
            <Route
              path="/dashboard/transactions"
              element={<DashboardPlaceholderPage />}
            />
            <Route
              path="/dashboard/profile"
              element={<DashboardPlaceholderPage />}
            />
          </Route>
        </Route>

        {/* Public & Web3 Voting Flow Routes */}
        <Route element={<PublicLayout />}>
          <Route path="/" element={<HomePage />} />
          <Route path="/elections" element={<ElectionsPage />} />
          <Route path="/elections/:id/results" element={<ElectionResultsPage />} />
          <Route path="/elections/:id" element={<ElectionDetailsPage />} />
          <Route path="/vote-success" element={<VoteSuccessPage />} />
          <Route
            path="/verify/:electionId"
            element={<BlockchainVerificationPage />}
          />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Route>
      </Routes>
    </DemoAuthProvider>
  )
}
