export interface Book {
  id: number;
  title: string;
  description: string;
  coverImageURI: string;
  contentURI: string;
  author: string;
  price: number;
  isPublished: boolean;
}

export interface Author {
  authorAddress: string;
  name: string;
  bio: string;
  profileImageURI: string;
  publishedBooks: number[];
  isRegistered: boolean;
}