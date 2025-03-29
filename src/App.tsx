import React, { useState } from 'react';
import { Routes, Route } from 'react-router-dom';
import { Book as BookIcon } from 'lucide-react';
import { WalletConnect } from './components/WalletConnect';
import { BookForm } from './components/BookForm';
import { BookList } from './components/BookList';
import { AuthorProfile } from './components/AuthorProfile';
import { Navigation } from './components/Navigation';
import { BookReader } from './components/BookReader';
import type { Book } from './types/book';

function App() {
  const [address, setAddress] = useState<string | null>(null);

  const handlePublishBook = async (bookData: Omit<Book, 'id' | 'author' | 'isPublished'>) => {
    if (!address) {
      alert('Please connect your wallet first');
      return;
    }

    try {
      // TODO: Implement contract interaction for publishing book
      console.log('Publishing book:', { ...bookData, author: address });
      alert('Book published successfully!');
    } catch (error) {
      console.error('Error publishing book:', error);
      alert('Failed to publish book. Please try again.');
    }
  };

  const handleDisconnect = () => {
    setAddress(null);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-indigo-50">
      <nav className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-2">
              <BookIcon className="w-8 h-8 text-purple-600" />
              <span className="text-xl font-bold text-gray-900">BookChain</span>
            </div>
            <Navigation address={address} />
            <WalletConnect 
              address={address} 
              onConnect={setAddress}
              onDisconnect={handleDisconnect}
            />
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <Routes>
          <Route path="/" element={
            <>
              <div className="text-center mb-12">
                <h1 className="text-4xl font-bold text-gray-900 mb-4">
                  Welcome to BookChain
                </h1>
                <p className="text-xl text-gray-600 mb-8">
                  Decentralized platform for authors to publish and sell their books
                </p>
                {!address && (
                  <p className="text-gray-500">
                    Connect your wallet to start publishing or purchasing books
                  </p>
                )}
              </div>

              <div className="space-y-12">
                {address && (
                  <div className="max-w-2xl mx-auto">
                    <BookForm onPublish={handlePublishBook} />
                  </div>
                )}
                
                <div className="mt-16">
                  <h2 className="text-2xl font-bold text-gray-900 mb-8">Published Books</h2>
                  <BookList address={address} />
                </div>
              </div>
            </>
          } />
          <Route path="/author/:address" element={<AuthorProfile />} />
          <Route path="/profile" element={
            address ? <AuthorProfile address={address} isOwnProfile={true} /> : (
              <div className="text-center py-12">
                <p className="text-gray-500">Please connect your wallet to view your profile</p>
              </div>
            )
          } />
          <Route path="/book/:id" element={<BookReader />} />
        </Routes>
      </main>
    </div>
  );
}

export default App;