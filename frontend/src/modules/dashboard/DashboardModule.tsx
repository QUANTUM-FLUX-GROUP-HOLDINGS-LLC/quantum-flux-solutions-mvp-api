import { useState, useEffect } from 'react';
import { UploadCard } from './components/UploadCard';

export const DashboardModule = () => {
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) setUser(JSON.parse(storedUser));
  }, []);

  return (
    <div className="max-w-5xl mx-auto p-6">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Welcome back, {user?.name || 'Client'}</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <UploadCard title="Upload Identification" description="Please upload a valid government ID (Driver's License or Passport)." />
        <UploadCard title="Upload Financial Documents" description="Upload your recent W-2, Paystubs, or Bank Statements." />
      </div>
    </div>
  );
};
