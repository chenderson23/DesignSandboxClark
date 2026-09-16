'use client';

import {
  PhxCard,
  PhxCardHeader,
  PhxCardContent,
} from '@Allegion/phoenix-react';

const STATS = [
  { label: 'Doors',  value: '1,247', icon: 'door_front'    },
  { label: 'Sites',  value: '38',    icon: 'location_city' },
  { label: 'Users',  value: '156',   icon: 'group'         },
];

export default function HomePage() {
  return (
    <div>
      <h1>Dashboard</h1>
      <div className="stat-grid">
        {STATS.map(stat => (
          <PhxCard key={stat.label} variant="elevated">
            <PhxCardHeader>
              <span className="material-icons">{stat.icon}</span>
              <span>{stat.label}</span>
            </PhxCardHeader>
            <PhxCardContent>
              <p className="stat-value">{stat.value}</p>
            </PhxCardContent>
          </PhxCard>
        ))}
      </div>
    </div>
  );
}
