import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from '@/src/hooks/useAuth';
import { AppLayout } from '@/src/components/layout/AppLayout';
import { Login } from '@/src/pages/Login';
import { Dashboard } from '@/src/pages/Dashboard';
import { Contacts } from '@/src/pages/Contacts';
import { Branches } from '@/src/pages/Branches';
import { TagsPage } from '@/src/pages/Tags';
import { Connections } from '@/src/pages/Connections';
import { Messages } from '@/src/pages/Messages';
import { Users } from '@/src/pages/Users';
import { Database } from '@/src/pages/Database';
import { Automations } from '@/src/pages/Automations';

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<Login />} />
          
          <Route element={<AppLayout />}>
            <Route path="/" element={<Dashboard />} />
            <Route path="/contacts" element={<Contacts />} />
            <Route path="/branches" element={<Branches />} />
            <Route path="/tags" element={<TagsPage />} />
            <Route path="/connections" element={<Connections />} />
            <Route path="/messages" element={<Messages />} />
            <Route path="/users" element={<Users />} />
            <Route path="/database" element={<Database />} />
            <Route path="/automations" element={<Automations />} />
          </Route>

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
