import React, { useState, useRef } from 'react';
import { Upload, BookOpen } from 'lucide-react';
import { uploadToIPFS } from '../utils/ipfs';
import { publishBook } from '../utils/web3';
import type { Book } from '../types/book';

interface BookFormProps {
  onPublish: (book: Omit<Book, 'id' | 'author' | 'isPublished'>) => Promise<void>;
}

export function BookForm({ onPublish }: BookFormProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    price: 0,
  });
  const coverInputRef = useRef<HTMLInputElement>(null);
  const contentInputRef = useRef<HTMLInputElement>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!coverInputRef.current?.files?.[0] || !contentInputRef.current?.files?.[0]) {
      alert('Please select both cover image and book content files');
      return;
    }

    try {
      setIsUploading(true);

      // Upload files to IPFS
      const [coverImageURI, contentURI] = await Promise.all([
        uploadToIPFS(coverInputRef.current.files[0]),
        uploadToIPFS(contentInputRef.current.files[0])
      ]);

      // Publish book to blockchain
      const bookData = {
        ...formData,
        coverImageURI,
        contentURI,
      };

      const publishedBook = await publishBook(bookData);
      await onPublish(bookData);

      // Reset form
      setFormData({ title: '', description: '', price: 0 });
      if (coverInputRef.current) coverInputRef.current.value = '';
      if (contentInputRef.current) contentInputRef.current.value = '';

      alert('Book published successfully! Transaction hash: ' + publishedBook.id);
    } catch (error) {
      console.error('Error publishing book:', error);
      alert('Failed to publish book. Please try again.');
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6 bg-white p-6 rounded-lg shadow-md">
      <h2 className="text-2xl font-bold text-gray-900">Publish New Book</h2>
      
      <div>
        <label htmlFor="title" className="block text-sm font-medium text-gray-700">
          Title
        </label>
        <input
          type="text"
          id="title"
          required
          value={formData.title}
          onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-purple-500 focus:ring-purple-500"
        />
      </div>

      <div>
        <label htmlFor="description" className="block text-sm font-medium text-gray-700">
          Description
        </label>
        <textarea
          id="description"
          required
          value={formData.description}
          onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
          rows={4}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-purple-500 focus:ring-purple-500"
        />
      </div>

      <div>
        <label htmlFor="price" className="block text-sm font-medium text-gray-700">
          Price (MATIC)
        </label>
        <input
          type="number"
          id="price"
          required
          min="0"
          step="0.01"
          value={formData.price}
          onChange={(e) => setFormData(prev => ({ ...prev, price: parseFloat(e.target.value) }))}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-purple-500 focus:ring-purple-500"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">Cover Image</label>
        <input
          type="file"
          ref={coverInputRef}
          accept="image/*"
          required
          className="mt-1 block w-full text-sm text-gray-500
            file:mr-4 file:py-2 file:px-4
            file:rounded-md file:border-0
            file:text-sm file:font-semibold
            file:bg-purple-50 file:text-purple-600
            hover:file:bg-purple-100"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">Book Content (PDF)</label>
        <input
          type="file"
          ref={contentInputRef}
          accept=".pdf"
          required
          className="mt-1 block w-full text-sm text-gray-500
            file:mr-4 file:py-2 file:px-4
            file:rounded-md file:border-0
            file:text-sm file:font-semibold
            file:bg-purple-50 file:text-purple-600
            hover:file:bg-purple-100"
        />
      </div>

      <button
        type="submit"
        disabled={isUploading}
        className="w-full flex justify-center items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors disabled:bg-purple-300"
      >
        {isUploading ? (
          <>
            <Upload className="w-5 h-5 animate-spin" />
            Publishing...
          </>
        ) : (
          <>
            <BookOpen className="w-5 h-5" />
            Publish Book
          </>
        )}
      </button>
    </form>
  );
}