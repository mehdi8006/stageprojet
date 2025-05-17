export const downloadFile = (filename) => {
    // Create a temporary anchor element
    const link = document.createElement('a');
    link.href = `/download/uploads/${filename}`;
    link.target = '_blank'; // Open in new tab
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
}; 