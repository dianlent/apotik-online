'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'

interface Profile {
    id: string
    full_name: string
    role: string
    created_at: string
}

export default function UserManagement() {
    const [profiles, setProfiles] = useState<Profile[]>([])
    const [loading, setLoading] = useState(true)
    const supabase = createClient()

    useEffect(() => {
        fetchProfiles()
    }, [])

    const fetchProfiles = async () => {
        const { data, error } = await supabase
            .from('profiles')
            .select('*')
            .order('created_at', { ascending: false })

        if (error) {
            console.error('Error fetching profiles:', error)
        } else {
            setProfiles(data || [])
        }
        setLoading(false)
    }

    const handleRoleChange = async (userId: string, newRole: string) => {
        const { error } = await supabase
            .from('profiles')
            .update({ role: newRole })
            .eq('id', userId)

        if (error) {
            alert('Error updating role')
            console.error(error)
        } else {
            alert('Role updated successfully')
            fetchProfiles()
        }
    }

    if (loading) return <div>Loading...</div>

    return (
        <div>
            <h3 className="text-gray-700 text-3xl font-medium">User Management</h3>

            <div className="mt-8 flex flex-col">
                <div className="-my-2 py-2 overflow-x-auto sm:-mx-6 sm:px-6 lg:-mx-8 lg:px-8">
                    <div className="align-middle inline-block min-w-full shadow overflow-hidden sm:rounded-lg border-b border-gray-200">
                        <table className="min-w-full">
                            <thead>
                                <tr>
                                    <th className="px-6 py-3 border-b border-gray-200 bg-gray-50 text-left text-xs leading-4 font-medium text-gray-500 uppercase tracking-wider">
                                        Name
                                    </th>
                                    <th className="px-6 py-3 border-b border-gray-200 bg-gray-50 text-left text-xs leading-4 font-medium text-gray-500 uppercase tracking-wider">
                                        Role
                                    </th>
                                    <th className="px-6 py-3 border-b border-gray-200 bg-gray-50 text-left text-xs leading-4 font-medium text-gray-500 uppercase tracking-wider">
                                        Actions
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="bg-white">
                                {profiles.map((profile) => (
                                    <tr key={profile.id}>
                                        <td className="px-6 py-4 whitespace-no-wrap border-b border-gray-200">
                                            <div className="text-sm leading-5 font-medium text-gray-900">{profile.full_name || 'N/A'}</div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-no-wrap border-b border-gray-200">
                                            <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${profile.role === 'admin' ? 'bg-red-100 text-red-800' :
                                                    profile.role === 'apoteker' ? 'bg-green-100 text-green-800' :
                                                        profile.role === 'kasir' ? 'bg-blue-100 text-blue-800' :
                                                            'bg-gray-100 text-gray-800'
                                                }`}>
                                                {profile.role}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-no-wrap border-b border-gray-200 text-sm leading-5 font-medium">
                                            <select
                                                value={profile.role}
                                                onChange={(e) => handleRoleChange(profile.id, e.target.value)}
                                                className="block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
                                            >
                                                <option value="customer">Customer</option>
                                                <option value="kasir">Kasir</option>
                                                <option value="apoteker">Apoteker</option>
                                                <option value="admin">Admin</option>
                                            </select>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    )
}
