import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

export interface PDFGenerationOptions {
  onProgress?: (progress: number) => void;
  includeLinks?: boolean;
}

export interface PDFGenerationResult {
  success: boolean;
  error?: string;
}

/**
 * Generates a PDF portfolio from the website content
 * Captures all sections, images, and preserves clickable links
 */
export async function generatePDF(
  options: PDFGenerationOptions = {}
): Promise<PDFGenerationResult> {
  const { onProgress, includeLinks = true } = options;

  try {
    // Report initial progress
    onProgress?.(0);

    // Get all main sections
    const sections = [
      { id: 'home', element: document.querySelector('#home-section') },
      { id: 'about', element: document.querySelector('#about-section') },
      { id: 'gallery', element: document.querySelector('#gallery-section') },
      { id: 'music', element: document.querySelector('#music-section') },
      { id: 'press', element: document.querySelector('#press-section') },
      { id: 'faq', element: document.querySelector('#faq-section') },
      { id: 'contact', element: document.querySelector('#contact-section') },
    ];

    // Filter out null sections
    const validSections = sections.filter(s => s.element !== null);

    if (validSections.length === 0) {
      throw new Error('No content sections found to generate PDF');
    }

    // Initialize PDF document (A4 size)
    const pdf = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4',
    });

    const pageWidth = pdf.internal.pageSize.getWidth();
    const pageHeight = pdf.internal.pageSize.getHeight();
    const margin = 15;
    const contentWidth = pageWidth - 2 * margin;

    // Add title page
    pdf.setFontSize(24);
    pdf.text('Portfolio', pageWidth / 2, 40, { align: 'center' });
    
    const artistName = document.querySelector('h1')?.textContent || 'Aishwarya Manikarnike';
    pdf.setFontSize(18);
    pdf.text(artistName, pageWidth / 2, 55, { align: 'center' });

    pdf.setFontSize(10);
    pdf.text(
      `Generated on ${new Date().toLocaleDateString()}`,
      pageWidth / 2,
      70,
      { align: 'center' }
    );

    // Track links for clickable PDF
    const links: Array<{ x: number; y: number; w: number; h: number; url: string; page: number }> = [];

    // Process each section
    for (let i = 0; i < validSections.length; i++) {
      const section = validSections[i];
      const element = section.element as HTMLElement;

      // Report progress
      const progress = ((i + 1) / validSections.length) * 90; // Reserve 10% for finalization
      onProgress?.(progress);

      // Add new page for each section (except first which uses title page)
      if (i > 0 || true) {
        pdf.addPage();
      }

      // WORKAROUND: html2canvas doesn't support oklch() colors from Tailwind CSS 4
      // We need to disable stylesheets BEFORE html2canvas starts parsing
      
      // Step 1: Temporarily disable all stylesheets
      const allStylesheets = Array.from(document.styleSheets);
      const disabledStates: boolean[] = [];
      
      allStylesheets.forEach((sheet, index) => {
        try {
          disabledStates[index] = sheet.disabled;
          sheet.disabled = true;
        } catch (e) {
          // Some stylesheets might not be accessible due to CORS
          disabledStates[index] = false;
        }
      });
      
      // Step 2: Apply computed styles inline to preserve appearance
      const applyInlineStyles = (el: Element) => {
        if (el instanceof HTMLElement) {
          const computed = window.getComputedStyle(el);
          
          // Copy essential computed styles as inline styles
          el.style.cssText += `
            color: ${computed.color};
            background-color: ${computed.backgroundColor};
            font-size: ${computed.fontSize};
            font-weight: ${computed.fontWeight};
            font-family: ${computed.fontFamily};
            padding: ${computed.padding};
            margin: ${computed.margin};
            border: ${computed.border};
            border-radius: ${computed.borderRadius};
            display: ${computed.display};
            text-align: ${computed.textAlign};
            line-height: ${computed.lineHeight};
          `;
        }
        
        // Recursively apply to all children
        Array.from(el.children).forEach(child => applyInlineStyles(child));
      };
      
      // Apply inline styles to the section
      applyInlineStyles(element);
      
      // Step 3: Capture with html2canvas (now without oklch in stylesheets)
      let canvas;
      try {
        canvas = await html2canvas(element, {
          scale: 2,
          useCORS: true,
          logging: false,
          backgroundColor: '#ffffff',
          windowWidth: 1200,
        });
      } finally {
        // Step 4: Re-enable all stylesheets
        allStylesheets.forEach((sheet, index) => {
          try {
            sheet.disabled = disabledStates[index];
          } catch (e) {
            // Ignore errors when re-enabling
          }
        });
      }

      // Calculate dimensions to fit page
      const imgWidth = contentWidth;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;

      // Handle content that spans multiple pages
      let yPosition = margin;
      let remainingHeight = imgHeight;
      let sourceY = 0;

      while (remainingHeight > 0) {
        const availableHeight = pageHeight - margin - yPosition;
        const heightToAdd = Math.min(remainingHeight, availableHeight);

        // Calculate source dimensions for this slice
        const sourceHeight = (heightToAdd / imgHeight) * canvas.height;

        // Create a temporary canvas for this slice
        const sliceCanvas = document.createElement('canvas');
        sliceCanvas.width = canvas.width;
        sliceCanvas.height = sourceHeight;
        const sliceCtx = sliceCanvas.getContext('2d');

        if (sliceCtx) {
          sliceCtx.drawImage(
            canvas,
            0,
            sourceY,
            canvas.width,
            sourceHeight,
            0,
            0,
            canvas.width,
            sourceHeight
          );

          const imgData = sliceCanvas.toDataURL('image/jpeg', 0.85);
          pdf.addImage(imgData, 'JPEG', margin, yPosition, imgWidth, heightToAdd);
        }

        remainingHeight -= heightToAdd;
        sourceY += sourceHeight;

        // Add new page if more content remains
        if (remainingHeight > 0) {
          pdf.addPage();
          yPosition = margin;
        }
      }

      // Extract links from this section if enabled
      if (includeLinks) {
        const sectionLinks = element.querySelectorAll('a[href]');
        const currentPage = pdf.internal.pages.length - 1;

        sectionLinks.forEach((link) => {
          const href = link.getAttribute('href');
          if (href && (href.startsWith('http') || href.startsWith('https'))) {
            const rect = link.getBoundingClientRect();
            const elementRect = element.getBoundingClientRect();

            // Calculate relative position within the section
            const relativeX = rect.left - elementRect.left;
            const relativeY = rect.top - elementRect.top;

            // Convert to PDF coordinates (approximate)
            const pdfX = margin + (relativeX / element.offsetWidth) * contentWidth;
            const pdfY = margin + (relativeY / element.offsetHeight) * imgHeight;

            links.push({
              x: pdfX,
              y: pdfY,
              w: (rect.width / element.offsetWidth) * contentWidth,
              h: (rect.height / element.offsetHeight) * imgHeight,
              url: href,
              page: currentPage,
            });
          }
        });
      }
    }

    // Add clickable links to PDF
    if (includeLinks && links.length > 0) {
      links.forEach((link) => {
        pdf.setPage(link.page);
        pdf.link(link.x, link.y, link.w, link.h, { url: link.url });
      });
    }

    // Report completion
    onProgress?.(100);

    // Save the PDF
    pdf.save(`portfolio-${new Date().getTime()}.pdf`);

    return { success: true };
  } catch (error) {
    console.error('PDF generation error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred',
    };
  }
}
