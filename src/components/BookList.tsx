import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { BookOpen, Loader2 } from 'lucide-react';
import type { Book } from '../types/book';
import { fetchPublishedBooks, purchaseBook, hasPurchasedBook } from '../utils/web3';

interface BookListProps {
  address: string | null;
}

export const BookList: React.FC<BookListProps> = ({ address }) => {
  const [books, setBooks] = useState<Book[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [purchasedBooks, setPurchasedBooks] = useState<{ [key: number]: boolean }>({});
  const [purchasing, setPurchasing] = useState<{ [key: number]: boolean }>({});
  const navigate = useNavigate();

  useEffect(() => {
    const loadBooks = async () => {
      try {
        setLoading(true);
        setError(null);
        const publishedBooks = await fetchPublishedBooks();
        setBooks(publishedBooks);

        // Load purchase status for each book if user is connected
        if (address) {
          const purchaseStatus: { [key: number]: boolean } = {};
          await Promise.all(
            publishedBooks.map(async (book) => {
              purchaseStatus[book.id] = await hasPurchasedBook(book.id, address);
            })
          );
          setPurchasedBooks(purchaseStatus);
        }
      } catch (err) {
        console.error('Error fetching books:', err);
        setError('Failed to load books. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    loadBooks();
  }, [address]);

  const handlePurchase = async (book: Book) => {
    if (!address) {
      alert('Please connect your wallet to purchase books');
      return;
    }

    try {
      setPurchasing(prev => ({ ...prev, [book.id]: true }));
      const { transactionHash } = await purchaseBook(book);
      setPurchasedBooks(prev => ({ ...prev, [book.id]: true }));
      alert(`Book purchased successfully!\nTransaction Hash: ${transactionHash}`);
    } catch (error: any) {
      console.error('Error purchasing book:', error);
      alert(error.message || 'Failed to purchase book. Please try again.');
    } finally {
      setPurchasing(prev => ({ ...prev, [book.id]: false }));
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-20">
        <Loader2 className="w-8 h-8 text-purple-600 animate-spin" />
        <span className="ml-2 text-gray-600">Loading books...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <p className="text-red-500">{error}</p>
        <button 
          className="mt-4 px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 transition-colors"
          onClick={() => window.location.reload()}
        >
          Try Again
        </button>
      </div>
    );
  }

  if (books.length === 0) {
    return (
      <div className="text-center py-16">
        <BookOpen className="w-16 h-16 text-gray-400 mx-auto mb-4" />
        <h3 className="text-xl font-medium text-gray-600">No books published yet</h3>
        {address && (
          <p className="mt-2 text-gray-500">
            Be the first to publish a book on BookChain!
          </p>
        )}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {books.map((book) => {
        const isOwner = book.author.toLowerCase() === address?.toLowerCase();
        const hasPurchased = purchasedBooks[book.id];
        const isPurchasing = purchasing[book.id];

        return (
          <div key={book.id} className="bg-white rounded-lg shadow-md overflow-hidden transition-transform hover:scale-105">
            <div 
              className="h-48 overflow-hidden cursor-pointer"
              onClick={() => navigate(`/book/${book.id}`)}
            >
              <img 
                src={book.coverImageURI} 
                alt={book.title} 
                className="w-full h-full object-cover"
                onError={(e) => {
                  (e.target as HTMLImageElement).src = 'https://via.placeholder.com/400x300?text=No+Cover';
                }}
              />
            </div>
            <div className="p-4">
              <h3 
                className="text-lg font-semibold text-gray-900 mb-2 truncate cursor-pointer hover:text-purple-600"
                onClick={() => navigate(`/book/${book.id}`)}
              >
                {book.title}
              </h3>
              <p className="text-gray-600 text-sm mb-3 line-clamp-2">{book.description}</p>
              <div className="flex justify-between items-center">
                <Link 
                  to={`/author/${book.author}`}
                  className="text-purple-600 hover:text-purple-700 transition-colors"
                >
                  {`${book.author.slice(0, 6)}...${book.author.slice(-4)}`}
                </Link>
                <span className="text-purple-600 font-medium">{book.price} MATIC</span>
              </div>
              <button 
                className={`mt-3 w-full px-3 py-2 rounded-md transition-colors ${
                  isOwner || hasPurchased
                    ? 'bg-green-600 hover:bg-green-700 text-white'
                    : 'bg-purple-600 hover:bg-purple-700 text-white'
                } disabled:bg-gray-300 disabled:cursor-not-allowed`}
                onClick={() => !isOwner && !hasPurchased && handlePurchase(book)}
                disabled={isOwner || hasPurchased || isPurchasing}
              >
                {isPurchasing ? (
                  <span className="flex items-center justify-center">
                    <Loader2 className="w-4 h-4 animate-spin mr-2" />
                    Processing...
                  </span>
                ) : isOwner ? (
                  'Your Book'
                ) : hasPurchased ? (
                  'Purchased'
                ) : (
                  'Purchase'
                )}
              </button>
            </div>
          </div>
        );
      })}
    </div>
  );
};