import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { platformApi } from '@/lib/api'
import { Badge } from '@/components/ui/badge'
import { Card } from '@/components/ui/card'
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/ui/table'

interface Company {
  _id: string
  name: string
  slug: string
}

interface User {
  _id: string
  email: string
  role: string
  firstName?: string
  lastName?: string
  lastLoginAt?: string
  companyId?: Company | null
  createdAt: string
}

export function Users() {
  const [users, setUsers] = useState<User[]>([])

  useEffect(() => { fetchUsers() }, [])

  async function fetchUsers() {
    const res = await platformApi.get('/api/users')
    if (res.ok) {
      const data = await res.json()
      setUsers(data.users)
    }
  }

  function fullName(u: User) {
    return [u.firstName, u.lastName].filter(Boolean).join(' ') || '—'
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold">Users</h1>
      </div>

      <Card>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Role</TableHead>
              <TableHead>Company</TableHead>
              <TableHead>Last login</TableHead>
              <TableHead>Joined</TableHead>
              <TableHead />
            </TableRow>
          </TableHeader>
          <TableBody>
            {users.length === 0 && (
              <TableRow>
                <TableCell colSpan={7} className="text-center text-muted-foreground py-8">
                  No users yet
                </TableCell>
              </TableRow>
            )}
            {users.map((u) => (
              <TableRow key={u._id}>
                <TableCell className="font-medium">{fullName(u)}</TableCell>
                <TableCell className="text-muted-foreground">{u.email}</TableCell>
                <TableCell>
                  <Badge variant={u.role === 'superadmin' ? 'default' : 'outline'}>{u.role}</Badge>
                </TableCell>
                <TableCell className="text-muted-foreground">
                  {u.companyId ? u.companyId.name : '—'}
                </TableCell>
                <TableCell className="text-muted-foreground">
                  {u.lastLoginAt ? new Date(u.lastLoginAt).toLocaleDateString() : '—'}
                </TableCell>
                <TableCell className="text-muted-foreground">
                  {new Date(u.createdAt).toLocaleDateString()}
                </TableCell>
                <TableCell>
                  <Link to={`/app/users/${u._id}`} className="text-sm text-primary hover:underline">
                    View →
                  </Link>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Card>
    </div>
  )
}
