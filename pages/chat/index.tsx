/* eslint-disable @typescript-eslint/no-explicit-any */
import service from '@/services/voiceChat.service';
import React from 'react';
import useSWR from 'swr';
import { useRouter } from 'next/router';
import Link from 'next/link';
import CheckIfSignedIn from '@/components/checkIfSignedIn';

const Page: React.FC = () => {
  const router = useRouter();

  const fetcher = async () => {
    const response = await service.getAllUsername("admin");
    const result = await response.json();
    return result;
  };

  const { data, isLoading, error, mutate } = useSWR('fetcher', fetcher);

  const handleDelete = async (id: string) => {
    try {
      await service.deleteChat(id); // Assuming this method exists
      await mutate(); // Revalidate the list after deletion
    } catch (err) {
      console.error('Failed to delete item', err);
    }
  };

  return (
    <div>
      <CheckIfSignedIn
      redirectTo="/login"
      loadingComponent={<div></div>}
    >
      <h1>Items List</h1>
      {isLoading && <p>Loading chats...</p>}
      {error && <p style={{ color: 'red' }}>Error loading chats.</p>}
      <table>
        <thead>
          <tr>
            <th>ID</th>
            <th>Name</th>
            <th>Created At</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {data?.response?.map((item: any, index: number) => (
            <tr
              key={index}
              style={{ cursor: 'pointer', backgroundColor: '#f9f9f9' }}
              onClick={() => router.push(`/chat/${item.id}`)}
              onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#eee'}
              onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#f9f9f9'}
            >
              <td>{item.id}</td>
              <td>{item.name}</td>
              <td>{new Date(item.createdAt).toLocaleString()}</td>
              <td>
                <button
                  onClick={(e) => {
                    e.stopPropagation(); // prevent row click
                    handleDelete(item.id);
                  }}
                >
                  Delete
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <Link href="chat/create/new">
        create new chat
      </Link>
      </CheckIfSignedIn>
    </div>
  );
};

export default Page;