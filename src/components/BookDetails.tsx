import React from 'react';
import { Book, User, Download, ExternalLink } from 'lucide-react';
import type { Book as BookType } from '../types/book';

interface BookDetailsProps {
  book: BookType;
  onClose: () => void;
  onPurchase: () => void;
  isOwner: boolean;
  isPurchased: boolean;
}

export function BookDetails({ book, onClose, onPurchase, isOwner, isPurchased }: BookDetailsProps) {
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="relative">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-gray-500 hover:text-gray-700"
          >
            <span className="sr-only">Close</span>
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>

          <div className="flex flex-col md:flex-row gap-6 p-6">
            <div className="w-full md:w-1/3">
              <img
                src={book.coverImageURI}
                alt={book.title}
                className="w-full aspect-[2/3] object-cover rounded-lg shadow-md"
                onError={(e) => {
                  (e.target as HTMLImageElement).src = 'https://via.placeholder.com/400x600?text=No+Cover';
                }}
              />
            </div>

            <div className="flex-1">
              <h2 className="text-2xl font-bold text-gray-900 mb-2">{book.title}</h2>
              
              <div className="flex items-center gap-2 text-gray-600 mb-4">
                <User className="w-4 h-4" />
                <span>{`${book.author.slice(0, 6)}...${book.author.slice(-4)}`}</span>
              </div>

              <div className="prose prose-purple max-w-none mb-6">
                <p className="text-gray-600">{book.description}</p>
              </div>

              <div className="flex items-center gap-4 mb-6">
                <span className="text-2xl font-bold text-purple-600">{book.price} MATIC</span>
                {!isOwner && !isPurchased && (
                  <button
                    onClick={onPurchase}
                    className="flex items-center gap-2 px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
                  >
                    <Book className="w-5 h-5" />
                    Purchase Book
                  </button>
                )}
                {(isOwner || isPurchased) && (
                  <button
                    onClick={() => window.open(book.contentURI, '_blank')}
                    className="flex items-center gap-2 px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                  >
                    <Download className="w-5 h-5" />
                    Download Book
                  </button>
                )}
              </div>

              <div className="border-t pt-4">
                <h3 className="font-semibold text-gray-900 mb-2">Book Details</h3>
                <dl className="grid grid-cols-2 gap-4">
                  <div>
                    <dt className="text-sm text-gray-500">IPFS Content</dt>
                    <dd className="flex items-center gap-1 text-sm text-purple-600">
                      <ExternalLink className="w-4 h-4" />
                      <a href={book.contentURI} target="_blank" rel="noopener noreferrer" className="hover:underline">
                        View on IPFS
                      </a>
                    </dd>
                  </div>
                  <div>
                    <dt className="text-sm text-gray-500">Publication Status</dt>
                    <dd className="text-sm font-medium text-green-600">Published</dd>
                  </div>
                </dl>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}