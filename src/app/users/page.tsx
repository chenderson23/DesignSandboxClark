'use client';

import { useRouter } from 'next/navigation';
import {
  PhxCard,
  PhxCardHeader,
  PhxCardContent,
  PhxButton,
} from '@Allegion/phoenix-react';

const FAKE_USERS = [
  { id: '1', name: 'Alice Johnson',  email: 'alice@example.com',   role: 'Admin'    },
  { id: '2', name: 'Bob Chen',       email: 'bob@example.com',     role: 'Manager'  },
  { id: '3', name: 'Carol Martinez', email: 'carol@example.com',   role: 'Operator' },
  { id: '4', name: 'David Kim',      email: 'david@example.com',   role: 'Viewer'   },
  { id: '5', name: 'Eva Patel',      email: 'eva@example.com',     role: 'Admin'    },
];

export default function UsersPage() {
  const router = useRouter();

  return (
    <div>
      <div className="page-header">
        <h1>Users</h1>
        <PhxButton variant="filled" icon="person_add" label="Add User" />
      </div>

      <PhxCard variant="outlined">
        <PhxCardHeader>
          <span>All Users</span>
        </PhxCardHeader>
        <PhxCardContent>
          <table className="users-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Email</th>
                <th>Role</th>
              </tr>
            </thead>
            <tbody>
              {FAKE_USERS.map(user => (
                <tr key={user.id} onClick={() => router.push(`/users/${user.id}`)}>
                  <td>{user.name}</td>
                  <td>{user.email}</td>
                  <td>{user.role}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </PhxCardContent>
      </PhxCard>
    </div>
  );
}
