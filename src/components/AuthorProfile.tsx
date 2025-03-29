import React, { useState, useEffect } from 'react';
import { User, BookOpen, Edit } from 'lucide-react';
import type { Author, Book } from '../types/book';
import { fetchAuthorProfile, fetchAuthorBooks } from '../utils/web3';

interface AuthorProfileProps {
  address: string;
  isOwnProfile?: boolean;
}

export function AuthorProfile({ address, isOwnProfile }: AuthorProfileProps) {
  const [author, setAuthor] = useState<Author | null>(null);
  const [books, setBooks] = useState<Book[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadAuthorData = async () => {
      try {
        setLoading(true);
        setError(null);
        const [authorData, authorBooks] = await Promise.all([
          fetchAuthorProfile(address),
          fetchAuthorBooks(address)
        ]);
        setAuthor(authorData);
        setBooks(authorBooks);
      } catch (err) {
        console.error('Error loading author data:', err);
        setError('Failed to load author profile. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    loadAuthorData();
  }, [address]);

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <div className="animate-pulse space-y-4">
          <div className="h-12 w-12 bg-gray-200 rounded-full mx-auto"></div>
          <div className="h-4 w-48 bg-gray-200 rounded mx-auto"></div>
          <div className="h-4 w-32 bg-gray-200 rounded mx-auto"></div>
        </div>
      </div>
    );
  }

  if (error || !author) {
    return (
      <div className="text-center py-12">
        <p className="text-red-500">{error || 'Author not found'}</p>
        <button 
          className="mt-4 px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 transition-colors"
          onClick={() => window.location.reload()}
        >
          Try Again
        </button>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden">
      <div className="bg-gradient-to-r from-purple-500 to-indigo-500 px-6 py-8 text-white">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            {author.profileImageURI ? (
              <img 
                src={author.profileImageURI} 
                alt={author.name} 
                className="w-20 h-20 rounded-full border-4 border-white"
              />
            ) : (
              <div className="w-20 h-20 rounded-full border-4 border-white flex items-center justify-center bg-purple-200">
                <User className="w-10 h-10 text-purple-600" />
              </div>
            )}
            <div>
              <h2 className="text-2xl font-bold">{author.name || 'Anonymous Author'}</h2>
              <p className="text-purple-100">{`${address.slice(0, 6)}...${address.slice(-4)}`}</p>
            </div>
          </div>
          {isOwnProfile && (
            <button className="flex items-center gap-2 px-4 py-2 bg-white/20 rounded-lg hover:bg-white/30 transition-colors">
              <Edit className="w-4 h-4" />
              Edit Profile
            </button>
          )}
        </div>
        <p className="mt-4 text-purple-50">{author.bio || 'No bio provided'}</p>
      </div>

      <div className="p-6">
        <div className="flex items-center gap-2 mb-6">
          <BookOpen className="w-5 h-5 text-purple-600" />
          <h3 className="text-xl font-semibold text-gray-900">Published Books</h3>
          <span className="ml-2 px-2 py-1 bg-purple-100 text-purple-600 text-sm rounded-full">
            {books.length}
          </span>
        </div>

        {books.length === 0 ? (
          <p className="text-center text-gray-500 py-8">No books published yet</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {books.map((book) => (
              <div key={book.id} className="flex gap-4 p-4 border rounded-lg hover:shadow-md transition-shadow">
                <div className="w-24 h-32 flex-shrink-0">
                  <img 
                    src={book.coverImageURI} 
                    alt={book.title} 
                    className="w-full h-full object-cover rounded"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = 'https://via.placeholder.com/400x300?text=No+Cover';
                    }}
                  />
                </div>
                <div className="flex-1">
                  <h4 className="font-semibold text-gray-900 mb-1">{book.title}</h4>
                  <p className="text-sm text-gray-600 line-clamp-2 mb-2">{book.description}</p>
                  <span className="text-purple-600 font-medium">{book.price} MATIC</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}