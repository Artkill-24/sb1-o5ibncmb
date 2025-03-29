// Mock IPFS upload functionality using local storage
export async function uploadToIPFS(file: File): Promise<string> {
  try {
    // Create a mock IPFS URL using the file name
    const mockCid = Math.random().toString(36).substring(2, 15);
    
    // Read the file as data URL for local storage
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        const dataUrl = reader.result as string;
        // Store in localStorage with the mock CID
        localStorage.setItem(`ipfs-${mockCid}`, dataUrl);
        // Return a mock IPFS URL
        resolve(`https://mock-ipfs.local/${mockCid}/${file.name}`);
      };
      reader.onerror = () => reject(new Error('Failed to read file'));
      reader.readAsDataURL(file);
    });
  } catch (error) {
    console.error('Error uploading to mock IPFS:', error);
    throw error;
  }
}