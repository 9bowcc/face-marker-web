import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { FileUploader } from './FileUploader';

describe('FileUploader', () => {
  it('should render upload area', () => {
    const onFileSelect = vi.fn();
    render(<FileUploader onFileSelect={onFileSelect} />);

    expect(
      screen.getByText(/Drop your file here or click to browse/i)
    ).toBeInTheDocument();
  });

  it('should show supported formats', () => {
    const onFileSelect = vi.fn();
    render(<FileUploader onFileSelect={onFileSelect} />);

    const imagesText = screen.getAllByText(/Images/i);
    const videosText = screen.getAllByText(/Videos/i);

    expect(imagesText.length).toBeGreaterThan(0);
    expect(videosText.length).toBeGreaterThan(0);
  });

  it('should handle file selection', () => {
    const onFileSelect = vi.fn();
    render(<FileUploader onFileSelect={onFileSelect} />);

    const file = new File(['test'], 'test.jpg', { type: 'image/jpeg' });
    const input = document.querySelector('input[type="file"]') as HTMLInputElement;

    expect(input).toBeInTheDocument();

    fireEvent.change(input!, {
      target: { files: [file] },
    });

    expect(onFileSelect).toHaveBeenCalledWith(file);
  });

  it('should handle drag and drop', () => {
    const onFileSelect = vi.fn();
    render(<FileUploader onFileSelect={onFileSelect} />);

    const dropzone = screen.getByText(/Drop your file here/i).parentElement;
    const file = new File(['test'], 'test.jpg', { type: 'image/jpeg' });

    fireEvent.dragOver(dropzone!);
    fireEvent.drop(dropzone!, {
      dataTransfer: {
        files: [file],
      },
    });

    expect(onFileSelect).toHaveBeenCalledWith(file);
  });

  it('should reject invalid file types', () => {
    const onFileSelect = vi.fn();
    render(<FileUploader onFileSelect={onFileSelect} />);

    const file = new File(['test'], 'test.txt', { type: 'text/plain' });
    const input = document.querySelector('input[type="file"]') as HTMLInputElement;

    fireEvent.change(input!, {
      target: { files: [file] },
    });

    expect(onFileSelect).not.toHaveBeenCalled();
  });

  it('should be disabled when disabled prop is true', () => {
    const onFileSelect = vi.fn();
    render(<FileUploader onFileSelect={onFileSelect} disabled={true} />);

    const input = document.querySelector('input[type="file"]') as HTMLInputElement;
    expect(input?.disabled).toBe(true);
  });

  it('should reset input after file selection', () => {
    const onFileSelect = vi.fn();
    render(<FileUploader onFileSelect={onFileSelect} />);

    const file = new File(['test'], 'test.jpg', { type: 'image/jpeg' });
    const input = document.querySelector('input[type="file"]') as HTMLInputElement;

    fireEvent.change(input!, {
      target: { files: [file] },
    });

    expect(input!.value).toBe('');
  });
});
