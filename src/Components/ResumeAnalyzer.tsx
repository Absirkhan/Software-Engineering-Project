import React, { useState, useRef } from 'react';
import { Upload, FileText, CheckCircle, AlertCircle, Download, RefreshCw } from 'lucide-react';

const ResumeAnalyzer = () => {
  const [file, setFile] = useState<File | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [feedback, setFeedback] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const droppedFile = e.dataTransfer.files[0];
      validateAndSetFile(droppedFile);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      validateAndSetFile(e.target.files[0]);
    }
  };

  const validateAndSetFile = (file: File) => {
    setError("");
    // Check if the file is a PDF
    if (file.type !== 'application/pdf') {
      setError("Please upload a PDF file");
      return;
    }
    
    // Check file size (less than 5MB)
    if (file.size > 5 * 1024 * 1024) {
      setError("File size should be less than 5MB");
      return;
    }
    
    setFile(file);
  };

  const handleUploadClick = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const analyzeResume = async () => {
    if (!file) return;
    
    setLoading(true);
    setError("");
    setFeedback("");
    
    try {
      const formData = new FormData();
      formData.append('pdfFile', file);
      
      const response = await fetch('/extract-text', {
        method: 'POST',
        body: formData,
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to analyze resume");
      }
      
      const data = await response.json();
      setFeedback(data.text);
    } catch (err) {
      setError(err instanceof Error ? err.message : "An unexpected error occurred");
    } finally {
      setLoading(false);
    }
  };

  const resetFile = () => {
    setFile(null);
    setFeedback("");
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const downloadFeedback = () => {
    if (!feedback) return;
    
    const blob = new Blob([feedback], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'resume-feedback.txt';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
      <div className="bg-white rounded-xl shadow-card p-6">
        <h2 className="text-xl font-semibold text-text mb-5 flex items-center">
          <Upload size={20} className="mr-2 text-secondary" />
          Upload Your Resume
        </h2>
        
        <div 
          className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
            isDragging 
              ? 'border-secondary bg-secondary/5' 
              : file 
                ? 'border-green-500 bg-green-50' 
                : 'border-gray-300 hover:border-secondary hover:bg-gray-50'
          }`}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
        >
          <input 
            type="file"
            ref={fileInputRef}
            onChange={handleFileChange}
            accept=".pdf"
            className="hidden"
          />
          
          {!file ? (
            <div>
              <FileText size={48} className="mx-auto mb-4 text-gray-400" />
              <p className="text-text font-medium mb-2">
                Drag & drop your resume PDF here
              </p>
              <p className="text-textLight text-sm mb-4">
                or
              </p>
              <button 
                onClick={handleUploadClick}
                className="px-4 py-2 bg-secondary text-white rounded-lg text-sm hover:bg-secondary/90 transition-colors"
              >
                Browse Files
              </button>
              <p className="text-xs text-textLight mt-4">
                Supported format: PDF (Max size: 5MB)
              </p>
            </div>
          ) : (
            <div>
              <CheckCircle size={48} className="mx-auto mb-4 text-green-500" />
              <p className="text-green-700 font-medium mb-1">
                File uploaded successfully!
              </p>
              <p className="text-sm text-green-600 mb-4">
                {file.name} ({Math.round(file.size / 1024)} KB)
              </p>
              <button 
                onClick={resetFile}
                className="px-4 py-2 border border-red-500 text-red-500 rounded-lg text-sm hover:bg-red-50 transition-colors mr-2"
              >
                Remove
              </button>
              <button 
                onClick={analyzeResume}
                className="px-4 py-2 bg-secondary text-white rounded-lg text-sm hover:bg-secondary/90 transition-colors"
                disabled={loading}
              >
                {loading ? (
                  <>
                    <RefreshCw size={16} className="mr-2 inline animate-spin" />
                    Analyzing...
                  </>
                ) : 'Analyze Resume'}
              </button>
            </div>
          )}
        </div>
        
        {error && (
          <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg flex items-start">
            <AlertCircle size={18} className="text-red-500 mr-2 flex-shrink-0 mt-0.5" />
            <p className="text-sm text-red-700">{error}</p>
          </div>
        )}
        
        <div className="mt-6">
          <h3 className="text-text font-medium mb-2">Tips for best results:</h3>
          <ul className="text-sm text-textLight space-y-2">
            <li className="flex items-start">
              <span className="bg-secondary/10 text-secondary rounded-full h-5 w-5 flex items-center justify-center mr-2 flex-shrink-0 mt-0.5">1</span>
              Make sure your PDF is not password protected
            </li>
            <li className="flex items-start">
              <span className="bg-secondary/10 text-secondary rounded-full h-5 w-5 flex items-center justify-center mr-2 flex-shrink-0 mt-0.5">2</span>
              Ensure text in your PDF is selectable (not scanned image)
            </li>
            <li className="flex items-start">
              <span className="bg-secondary/10 text-secondary rounded-full h-5 w-5 flex items-center justify-center mr-2 flex-shrink-0 mt-0.5">3</span>
              Include relevant skills and experiences for more accurate feedback
            </li>
          </ul>
        </div>
      </div>
      
      <div className="bg-white rounded-xl shadow-card p-6">
        <div className="flex justify-between items-center mb-5">
          <h2 className="text-xl font-semibold text-text flex items-center">
            <FileText size={20} className="mr-2 text-secondary" />
            AI Feedback
          </h2>
          
          {feedback && (
            <button 
              onClick={downloadFeedback}
              className="px-3 py-1.5 text-xs bg-gray-100 text-textLight rounded flex items-center hover:bg-gray-200 transition-colors"
            >
              <Download size={14} className="mr-1" />
              Download
            </button>
          )}
        </div>
        
        {loading ? (
          <div className="h-64 flex flex-col items-center justify-center text-textLight">
            <div className="w-12 h-12 border-t-2 border-secondary rounded-full animate-spin mb-4"></div>
            <p>Analyzing your resume...</p>
            <p className="text-xs mt-2">This may take a few moments</p>
          </div>
        ) : feedback ? (
          <div className="prose prose-sm max-w-none bg-gray-50 rounded-lg p-5 h-[400px] overflow-y-auto whitespace-pre-line">
            {feedback}
          </div>
        ) : (
          <div className="h-64 flex flex-col items-center justify-center text-textLight">
            <FileText size={48} className="text-gray-300 mb-4" />
            <p>Upload your resume to get personalized feedback</p>
            <p className="text-xs mt-2">Feedback will appear here after analysis</p>
          </div>
        )}
        
        {feedback && (
          <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h3 className="text-blue-800 font-medium mb-2">How to use this feedback:</h3>
            <p className="text-sm text-blue-700 mb-3">
              This AI analysis highlights areas for improvement in your resume. Consider these recommendations to enhance your job application success rate.
            </p>
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div className="flex items-start">
                <CheckCircle size={16} className="text-green-500 mr-2 mt-0.5" />
                <span className="text-textLight">Update your resume based on feedback</span>
              </div>
              <div className="flex items-start">
                <CheckCircle size={16} className="text-green-500 mr-2 mt-0.5" />
                <span className="text-textLight">Tailor it to specific job descriptions</span>
              </div>
              <div className="flex items-start">
                <CheckCircle size={16} className="text-green-500 mr-2 mt-0.5" />
                <span className="text-textLight">Highlight relevant accomplishments</span>
              </div>
              <div className="flex items-start">
                <CheckCircle size={16} className="text-green-500 mr-2 mt-0.5" />
                <span className="text-textLight">Use action verbs and quantify results</span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ResumeAnalyzer;
