import jsPDF from 'jspdf';
import { toPng } from 'html-to-image';

export const generatePDF = async (elementId: string, filename: string): Promise<boolean> => {
  const element = document.getElementById(elementId);
  if (!element) {
    console.error(`Element with id '${elementId}' not found`);
    return false;
  }

  try {
    // Create a container for the clone to isolate it and ensure it renders
    const container = document.createElement('div');
    container.style.position = 'absolute';
    container.style.top = '0';
    container.style.left = '-9999px'; // Move off-screen horizontally
    // Set width to match the original element's width to preserve layout
    container.style.width = `${element.offsetWidth}px`;
    container.style.zIndex = '-1000';
    document.body.appendChild(container);

    // Clone the element
    const clone = element.cloneNode(true) as HTMLElement;
    
    // Style the clone to ensure it captures correctly
    clone.style.width = '100%';
    clone.style.height = 'auto';
    clone.style.overflow = 'visible';
    clone.style.maxHeight = 'none';
    clone.style.background = '#ffffff'; // Ensure white background
    
    // Remove any potential transform/transition styles that might interfere
    clone.style.transform = 'none';
    clone.style.transition = 'none';
    
    // Fix for text rendering and visual glitches
    // 1. Remove backdrop-filter (causes artifacts)
    // 2. Remove box-shadow (can cause rendering issues)
    const allElements = clone.querySelectorAll('*');
    allElements.forEach((el) => {
        const style = (el as HTMLElement).style;
        if (style) {
            style.backdropFilter = 'none';
            // We keep box-shadow as it usually renders fine with higher pixelRatio, 
            // but if glitches persist we might need to remove it.
            // For now, let's focus on backdrop-filter which is the main culprit.
        }
    });

    // Manually remove elements that should be ignored
    const ignoredElements = clone.querySelectorAll('[data-html2canvas-ignore]');
    ignoredElements.forEach(el => el.remove());
    
    container.appendChild(clone);

    // Wait for fonts to be ready
    await document.fonts.ready;
    // Additional small delay for layout stability
    await new Promise(resolve => setTimeout(resolve, 500));

    // Capture
    const dataUrl = await toPng(clone, {
      quality: 1.0,
      pixelRatio: 2, // Improve resolution to fix text blur/glitches
      backgroundColor: '#ffffff',
      cacheBust: true,
      width: clone.scrollWidth,
      height: clone.scrollHeight,
      style: {
        transform: 'none',
        transformOrigin: 'top left',
        fontVariantLigatures: 'no-common-ligatures' // Disable ligatures to prevent text glitches
      }
    });

    // Clean up
    document.body.removeChild(container);

    if (dataUrl.length < 1000) {
        console.error("Generated image is too small, likely blank.");
        throw new Error("Generated PDF content is empty. Please try again.");
    }

    // Create a temporary PDF to get image properties
    const tempPdf = new jsPDF();
    const imgProps = tempPdf.getImageProperties(dataUrl);

    const pdf = new jsPDF({
      orientation: 'portrait',
      unit: 'px',
      format: [imgProps.width, imgProps.height] // Set page size to match image size
    });

    pdf.addImage(dataUrl, 'PNG', 0, 0, imgProps.width, imgProps.height);
    pdf.save(`${filename}.pdf`);
    return true;
  } catch (error) {
    console.error("Error generating PDF:", error);
    alert(`Error generating PDF: ${error instanceof Error ? error.message : String(error)}`);
    return false;
  }
};
