export const downloadChromeExtension = () => {
  // Convert Google Drive sharing link to direct download link
  const driveFileId = '1HAo-xe-FWyHpsysNMgsUjgZg-kzsIw6O';
  const downloadUrl = `https://drive.google.com/uc?export=download&id=${driveFileId}`;
  
  // Create a temporary link and trigger download
  const link = document.createElement('a');
  link.href = downloadUrl;
  link.download = 'spot-the-fake-extension.zip';
  link.target = '_blank';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  
  return true;
};

export const downloadFirefoxExtension = () => {
  // Similar implementation for Firefox
  alert('Firefox extension download will be available soon. The Chrome extension can also work in Firefox with minor modifications.');
};