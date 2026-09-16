'use client';

import { useParams, useRouter } from 'next/navigation';
import {
  PhxCard,
  PhxCardHeader,
  PhxCardContent,
  PhxCardActions,
  PhxButton,
} from '@Allegion/phoenix-react';

const FAKE_USERS = [
  { id: '1', name: 'Alice Johnson',  email: 'alice@example.com',   role: 'Admin'    },
  { id: '2', name: 'Bob Chen',       email: 'bob@example.com',     role: 'Manager'  },
  { id: '3', name: 'Carol Martinez', email: 'carol@example.com',   role: 'Operator' },
  { id: '4', name: 'David Kim',      email: 'david@example.com',   role: 'Viewer'   },
  { id: '5', name: 'Eva Patel',      email: 'eva@example.com',     role: 'Admin'    },
];

export default function UserDetailPage() {
  const params = useParams();
  const router = useRouter();

  const user = FAKE_USERS.find(u => u.id === params.id) ?? {
    id: params.id as string,
    name: 'Unknown User',
    email: 'unknown@example.com',
    role: 'Unknown',
  };

  return (
    <div>
      <h1>User Profile</h1>
      <div className="user-detail-card">
        <PhxCard variant="elevated">
          <PhxCardHeader>
            <span className="material-icons" style={{ fontSize: '40px' }}>account_circle</span>
            <span>{user.name}</span>
          </PhxCardHeader>
          <PhxCardContent>
            <p className="user-detail-field"><strong>Email:</strong> {user.email}</p>
            <p className="user-detail-field"><strong>Role:</strong> {user.role}</p>
            <p className="user-detail-field"><strong>ID:</strong> {user.id}</p>
          </PhxCardContent>
          <PhxCardActions>
            <PhxButton variant="outlined" icon="edit" label="Edit User" />
            <PhxButton variant="text" label="Back to Users" onClick={() => router.push('/users')} />
          </PhxCardActions>
        </PhxCard>
      </div>
    </div>
  );
}
