import { useState, useEffect } from 'react'
import { platformApi } from '@/lib/api'
import { Badge } from '@/components/ui/badge'
import { Card } from '@/components/ui/card'
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/ui/table'

interface User {
  _id: string
  email: string
  role: string
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

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold">Users</h1>
      </div>

      <Card>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Email</TableHead>
              <TableHead>Role</TableHead>
              <TableHead>Created</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {users.length === 0 && (
              <TableRow>
                <TableCell colSpan={3} className="text-center text-muted-foreground py-8">
                  No users yet
                </TableCell>
              </TableRow>
            )}
            {users.map((u) => (
              <TableRow key={u._id}>
                <TableCell className="font-medium">{u.email}</TableCell>
                <TableCell>
                  <Badge variant={u.role === 'superadmin' ? 'default' : 'outline'}>{u.role}</Badge>
                </TableCell>
                <TableCell className="text-muted-foreground">{new Date(u.createdAt).toLocaleDateString()}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Card>
    </div>
  )
}
