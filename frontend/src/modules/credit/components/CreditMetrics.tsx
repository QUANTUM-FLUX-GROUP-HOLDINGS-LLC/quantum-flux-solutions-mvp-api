import styles from './credit.module.css';

export const CreditMetrics = ({ clients }: { clients: any[] }) => {
  const total = clients.length;
  const newEnrollments = clients.filter(c => new Date(c.createdAt) > new Date(Date.now() - 30*24*60*60*1000)).length;
  const active = clients.filter(c => c.role === 'CLIENT').length;

  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
      {[
        { label: 'TOTAL CLIENTS', value: total, sub: 'Excludes finished and deleted...' },
        { label: 'NEW ENROLLMENTS (30D)', value: newEnrollments, sub: '' },
        { label: 'ACTIVE', value: active, sub: '' },
        { label: 'NEEDS ATTENTION', value: '0', sub: 'All Clear' },
      ].map((stat, i) => (
        <div key={i} className={styles.metricCard}>
          <p className="text-xs font-semibold text-gray-500 tracking-wider">{stat.label}</p>
          <p className={styles.metricValue}>{stat.value}</p>
          {stat.sub && <p className="text-xs text-gray-400 mt-1">{stat.sub}</p>}
        </div>
      ))}
    </div>
  );
};
