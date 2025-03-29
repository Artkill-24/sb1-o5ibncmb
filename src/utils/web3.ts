import { ethers } from 'ethers';
import type { Book, Author } from '../types/book';

export async function connectWallet(): Promise<string> {
  if (!window.ethereum) {
    throw new Error('MetaMask is not installed');
  }

  try {
    const provider = new ethers.BrowserProvider(window.ethereum);
    const accounts = await provider.send('eth_requestAccounts', []);
    return accounts[0];
  } catch (error) {
    console.error('Error connecting wallet:', error);
    throw error;
  }
}

export async function disconnectWallet(): Promise<void> {
  if (!window.ethereum) {
    throw new Error('MetaMask is not installed');
  }

  // Clear any local wallet state
  localStorage.removeItem('walletConnected');
}

export async function getProvider() {
  if (!window.ethereum) {
    throw new Error('MetaMask is not installed');
  }
  return new ethers.BrowserProvider(window.ethereum);
}

export async function getSigner() {
  const provider = await getProvider();
  return provider.getSigner();
}

export async function purchaseBook(book: Book): Promise<{ transactionHash: string }> {
  try {
    const signer = await getSigner();
    const buyerAddress = await signer.getAddress();

    if (book.author.toLowerCase() === buyerAddress.toLowerCase()) {
      throw new Error("You can't purchase your own book");
    }

    // Convert price from MATIC to Wei
    const priceInWei = ethers.parseEther(book.price.toString());

    // Create transaction
    const tx = await signer.sendTransaction({
      to: book.author,
      value: priceInWei,
    });

    // Wait for transaction to be mined
    const receipt = await tx.wait();

    if (!receipt) {
      throw new Error('Transaction failed');
    }

    // Store purchase in local storage
    const purchasedBooks = JSON.parse(localStorage.getItem('purchasedBooks') || '[]');
    purchasedBooks.push({
      bookId: book.id,
      buyerAddress,
      transactionHash: receipt.hash,
      timestamp: Date.now(),
    });
    localStorage.setItem('purchasedBooks', JSON.stringify(purchasedBooks));

    return {
      transactionHash: receipt.hash,
    };
  } catch (error) {
    console.error('Error purchasing book:', error);
    throw error;
  }
}

export async function hasPurchasedBook(bookId: number, address: string): Promise<boolean> {
  const purchasedBooks = JSON.parse(localStorage.getItem('purchasedBooks') || '[]');
  return purchasedBooks.some(
    (purchase: { bookId: number; buyerAddress: string }) =>
      purchase.bookId === bookId && purchase.buyerAddress.toLowerCase() === address.toLowerCase()
  );
}

export async function publishBook(bookData: Omit<Book, 'id' | 'author' | 'isPublished'>): Promise<Book> {
  const signer = await getSigner();
  const address = await signer.getAddress();

  // Simulate contract interaction delay
  await new Promise(resolve => setTimeout(resolve, 1000));

  // In a real implementation, this would interact with the smart contract
  const newBook: Book = {
    id: Math.floor(Math.random() * 1000000), // Generate random ID for mock
    ...bookData,
    author: address,
    isPublished: true
  };

  // Store in local storage for persistence
  const storedBooks = JSON.parse(localStorage.getItem('publishedBooks') || '[]');
  storedBooks.push(newBook);
  localStorage.setItem('publishedBooks', JSON.stringify(storedBooks));

  return newBook;
}

export async function fetchPublishedBooks(): Promise<Book[]> {
  await new Promise(resolve => setTimeout(resolve, 1000));
  
  // Get books from local storage
  const storedBooks = JSON.parse(localStorage.getItem('publishedBooks') || '[]');
  
  // Combine with mock data if no stored books
  if (storedBooks.length === 0) {
    return [
      {
        id: 1,
        title: "The Blockchain Revolution",
        description: "A comprehensive guide to understanding blockchain technology and its implications for the future of digital transactions.",
        coverImageURI: "https://images.unsplash.com/photo-1516414447565-b14be0adf13e?w=400&h=300&fit=crop",
        contentURI: "ipfs://QmExample1",
        author: "0x1234567890123456789012345678901234567890",
        price: 0.1,
        isPublished: true
      },
      {
        id: 2,
        title: "Web3 Development",
        description: "Learn how to build decentralized applications using modern web technologies and smart contracts.",
        coverImageURI: "https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=400&h=300&fit=crop",
        contentURI: "ipfs://QmExample2",
        author: "0x2345678901234567890123456789012345678901",
        price: 0.15,
        isPublished: true
      }
    ];
  }

  return storedBooks;
}

export async function fetchAuthorProfile(address: string): Promise<Author> {
  await new Promise(resolve => setTimeout(resolve, 800));
  
  return {
    authorAddress: address,
    name: "John Doe",
    bio: "Blockchain enthusiast and technical author with a passion for decentralized technologies.",
    profileImageURI: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400&h=400&fit=crop",
    publishedBooks: [1, 2],
    isRegistered: true
  };
}

export async function fetchAuthorBooks(address: string): Promise<Book[]> {
  const allBooks = await fetchPublishedBooks();
  return allBooks.filter(book => book.author.toLowerCase() === address.toLowerCase());
}