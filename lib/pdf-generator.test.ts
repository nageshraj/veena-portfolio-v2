import { describe, it, expect, vi, beforeEach } from 'vitest';
import { generatePDF } from './pdf-generator';

// Mock jsPDF and html2canvas
vi.mock('jspdf', () => {
  return {
    default: vi.fn().mockImplementation(() => ({
      internal: {
        pageSize: {
          getWidth: () => 210,
          getHeight: () => 297,
        },
        pages: [null, {}, {}], // Mock pages array
      },
      setFontSize: vi.fn(),
      text: vi.fn(),
      addPage: vi.fn(),
      addImage: vi.fn(),
      link: vi.fn(),
      setPage: vi.fn(),
      save: vi.fn(),
    })),
  };
});

vi.mock('html2canvas', () => ({
  default: vi.fn().mockResolvedValue({
    width: 1200,
    height: 800,
    toDataURL: vi.fn().mockReturnValue('data:image/jpeg;base64,mock'),
  }),
}));

describe('PDF Generator', () => {
  beforeEach(() => {
    // Mock canvas methods to avoid jsdom errors
    HTMLCanvasElement.prototype.toDataURL = vi.fn().mockReturnValue('data:image/jpeg;base64,mock');
    HTMLCanvasElement.prototype.getContext = vi.fn().mockReturnValue({
      drawImage: vi.fn(),
      fillRect: vi.fn(),
      clearRect: vi.fn(),
      getImageData: vi.fn(),
      putImageData: vi.fn(),
      createImageData: vi.fn(),
      setTransform: vi.fn(),
      save: vi.fn(),
      restore: vi.fn(),
      scale: vi.fn(),
      rotate: vi.fn(),
      translate: vi.fn(),
      transform: vi.fn(),
      beginPath: vi.fn(),
      closePath: vi.fn(),
      moveTo: vi.fn(),
      lineTo: vi.fn(),
      bezierCurveTo: vi.fn(),
      quadraticCurveTo: vi.fn(),
      arc: vi.fn(),
      arcTo: vi.fn(),
      ellipse: vi.fn(),
      rect: vi.fn(),
      fill: vi.fn(),
      stroke: vi.fn(),
      clip: vi.fn(),
      isPointInPath: vi.fn(),
      isPointInStroke: vi.fn(),
      fillText: vi.fn(),
      strokeText: vi.fn(),
      measureText: vi.fn(),
      canvas: document.createElement('canvas'),
    });

    // Setup DOM with mock sections
    document.body.innerHTML = `
      <div id="home-section">
        <h1>Home Section</h1>
        <a href="https://example.com">External Link</a>
      </div>
      <div id="about-section">
        <h2>About Section</h2>
      </div>
      <div id="gallery-section">
        <h2>Gallery Section</h2>
      </div>
      <div id="music-section">
        <h2>Music Section</h2>
      </div>
      <div id="press-section">
        <h2>Press Section</h2>
      </div>
      <div id="faq-section">
        <h2>FAQ Section</h2>
      </div>
      <div id="contact-section">
        <h2>Contact Section</h2>
      </div>
    `;
  });

  it('should successfully generate PDF with all sections', async () => {
    const result = await generatePDF();
    
    expect(result.success).toBe(true);
    expect(result.error).toBeUndefined();
  });

  it('should call progress callback during generation', async () => {
    const onProgress = vi.fn();
    
    await generatePDF({ onProgress });
    
    expect(onProgress).toHaveBeenCalled();
    expect(onProgress).toHaveBeenCalledWith(expect.any(Number));
  });

  it('should handle missing sections gracefully', async () => {
    document.body.innerHTML = '<div>No sections</div>';
    
    const result = await generatePDF();
    
    expect(result.success).toBe(false);
    expect(result.error).toContain('No content sections found');
  });

  it('should include links when includeLinks is true', async () => {
    const result = await generatePDF({ includeLinks: true });
    
    expect(result.success).toBe(true);
  });

  it('should work without links when includeLinks is false', async () => {
    const result = await generatePDF({ includeLinks: false });
    
    expect(result.success).toBe(true);
  });
});
