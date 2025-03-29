import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ChevronLeft, ChevronRight, X, Maximize2, Minimize2, ShoppingCart } from 'lucide-react';
import type { Book } from '../types/book';
import { fetchPublishedBooks, purchaseBook, hasPurchasedBook } from '../utils/web3';

export function BookReader() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [book, setBook] = useState<Book | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [hasPurchased, setHasPurchased] = useState(false);
  const [purchasing, setPurchasing] = useState(false);
  const [isOwner, setIsOwner] = useState(false);

  useEffect(() => {
    const loadBook = async () => {
      try {
        setLoading(true);
        setError(null);
        const books = await fetchPublishedBooks();
        const foundBook = books.find(b => b.id.toString() === id);
        if (!foundBook) {
          throw new Error('Book not found');
        }
        setBook(foundBook);

        // Check if user has purchased the book and if they are the owner
        if (window.ethereum) {
          const accounts = await window.ethereum.request({ method: 'eth_accounts' });
          if (accounts[0]) {
            const purchased = await hasPurchasedBook(foundBook.id, accounts[0]);
            setHasPurchased(purchased);
            setIsOwner(foundBook.author.toLowerCase() === accounts[0].toLowerCase());
          }
        }
      } catch (err) {
        console.error('Error loading book:', err);
        setError('Failed to load book. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    loadBook();
  }, [id]);

  const handlePurchase = async () => {
    if (!book) return;

    try {
      // Get the connected user's address
      const accounts = await window.ethereum.request({ method: 'eth_accounts' });
      if (!accounts[0]) {
        alert('Please connect your wallet to purchase books');
        return;
      }

      // Check if the user is the author
      if (book.author.toLowerCase() === accounts[0].toLowerCase()) {
        alert("You can't purchase your own book");
        return;
      }

      setPurchasing(true);
      const { transactionHash } = await purchaseBook(book);
      setHasPurchased(true);
      alert(`Book purchased successfully!\nTransaction Hash: ${transactionHash}`);
    } catch (error: any) {
      console.error('Error purchasing book:', error);
      alert(error.message || 'Failed to purchase book. Please try again.');
    } finally {
      setPurchasing(false);
    }
  };

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen();
      setIsFullscreen(true);
    } else {
      document.exitFullscreen();
      setIsFullscreen(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
      </div>
    );
  }

  if (error || !book) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <p className="text-red-500 mb-4">{error || 'Book not found'}</p>
        <button
          onClick={() => navigate('/')}
          className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
        >
          Return to Home
        </button>
      </div>
    );
  }

  return (
    <div className={`min-h-screen bg-gray-100 ${isFullscreen ? 'fixed inset-0 z-50' : ''}`}>
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="bg-white rounded-lg shadow-lg overflow-hidden">
          {/* Reader Header */}
          <div className="flex items-center justify-between p-4 border-b">
            <button
              onClick={() => navigate('/')}
              className="flex items-center gap-2 text-gray-600 hover:text-gray-900"
            >
              <ChevronLeft className="w-5 h-5" />
              <span>Back</span>
            </button>
            <h1 className="text-xl font-bold text-gray-900">{book.title}</h1>
            <button
              onClick={toggleFullscreen}
              className="text-gray-600 hover:text-gray-900"
            >
              {isFullscreen ? (
                <Minimize2 className="w-5 h-5" />
              ) : (
                <Maximize2 className="w-5 h-5" />
              )}
            </button>
          </div>

          {/* Book Content */}
          <div className="p-8">
            <div className="prose max-w-none">
              <h2 className="text-2xl font-bold mb-4">{book.title}</h2>
              <p className="text-gray-600 mb-4">
                By {`${book.author.slice(0, 6)}...${book.author.slice(-4)}`}
              </p>
              <div className="aspect-[3/4] max-w-sm mx-auto mb-8">
                <img
                  src={book.coverImageURI}
                  alt={book.title}
                  className="w-full h-full object-cover rounded-lg shadow-md"
                />
              </div>
              <p className="text-gray-800 leading-relaxed">{book.description}</p>
              
              {/* Purchase or Access Content Section */}
              <div className="mt-8 p-4 bg-gray-50 rounded-lg">
                {isOwner ? (
                  <>
                    <p className="text-green-600 font-medium text-center mb-4">
                      This is your book
                    </p>
                    <div className="flex justify-center">
                      <a
                        href={book.contentURI}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                      >
                        Read Full Book
                      </a>
                    </div>
                  </>
                ) : hasPurchased ? (
                  <>
                    <p className="text-green-600 font-medium text-center mb-4">
                      You own this book! Enjoy reading.
                    </p>
                    <div className="flex justify-center">
                      <a
                        href={book.contentURI}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                      >
                        Read Full Book
                      </a>
                    </div>
                  </>
                ) : (
                  <>
                    <p className="text-center text-gray-600 mb-4">
                      Purchase this book to access the full content
                    </p>
                    <div className="flex justify-center">
                      <button
                        onClick={handlePurchase}
                        disabled={purchasing}
                        className="flex items-center gap-2 px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors disabled:bg-purple-400"
                      >
                        {purchasing ? (
                          <>
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                            Processing...
                          </>
                        ) : (
                          <>
                            <ShoppingCart className="w-5 h-5" />
                            Purchase for {book.price} MATIC
                          </>
                        )}
                      </button>
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>

          {/* Reader Footer */}
          <div className="flex items-center justify-between p-4 border-t">
            <button
              className="flex items-center gap-2 px-4 py-2 text-gray-600 hover:text-gray-900 disabled:opacity-50"
              disabled={true}
            >
              <ChevronLeft className="w-5 h-5" />
              Previous Page
            </button>
            <span className="text-gray-600">Page 1 of 1</span>
            <button
              className="flex items-center gap-2 px-4 py-2 text-gray-600 hover:text-gray-900 disabled:opacity-50"
              disabled={true}
            >
              Next Page
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}