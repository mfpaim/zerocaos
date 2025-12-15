import { RequestList } from '@/components/RequestList';

const Dashboard = () => {
  return (
    <div className="p-4 lg:p-8">
      <div className="mb-6">
        <h1 className="text-2xl lg:text-3xl font-bold text-foreground">Dashboard</h1>
        <p className="text-muted-foreground mt-1">Gerencie as solicitações dos condomínios</p>
      </div>
      <RequestList />
    </div>
  );
};

export default Dashboard;