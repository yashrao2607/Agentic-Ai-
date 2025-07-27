import React from 'react';
import { CheckCircle, AlertTriangle, XCircle, Clock, Camera, MapPin } from 'lucide-react';

interface ImageValidation {
  is_valid: boolean;
  warnings: string[];
  errors: string[];
  metadata?: {
    format: string;
    size: [number, number];
    file_size: number;
    creation_time?: string;
    modification_time?: string;
    exif_data: Record<string, any>;
  };
}

interface ImageValidationDisplayProps {
  validation: ImageValidation;
  className?: string;
}

const ImageValidationDisplay: React.FC<ImageValidationDisplayProps> = ({ validation, className = '' }) => {
  if (!validation) {
    return (
      <div className={`p-4 bg-gray-50 rounded-lg ${className}`}>
        <div className="flex items-center gap-2 text-gray-500">
          <Clock className="w-4 h-4" />
          <span className="text-sm">Image validation pending...</span>
        </div>
      </div>
    );
  }

  const getStatusIcon = () => {
    if (validation.is_valid && validation.errors.length === 0) {
      return <CheckCircle className="w-5 h-5 text-green-500" />;
    } else if (validation.errors.length > 0) {
      return <XCircle className="w-5 h-5 text-red-500" />;
    } else {
      return <AlertTriangle className="w-5 h-5 text-yellow-500" />;
    }
  };

  const getStatusText = () => {
    if (validation.is_valid && validation.errors.length === 0) {
      return "Valid Image";
    } else if (validation.errors.length > 0) {
      return "Invalid Image";
    } else {
      return "Image with Warnings";
    }
  };

  const getStatusColor = () => {
    if (validation.is_valid && validation.errors.length === 0) {
      return "text-green-600 bg-green-50";
    } else if (validation.errors.length > 0) {
      return "text-red-600 bg-red-50";
    } else {
      return "text-yellow-600 bg-yellow-50";
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      return date.toLocaleString();
    } catch {
      return dateString;
    }
  };

  return (
    <div className={`p-4 border rounded-lg ${className}`}>
      <div className="flex items-center gap-2 mb-3">
        {getStatusIcon()}
        <span className={`font-semibold ${getStatusColor()}`}>
          {getStatusText()}
        </span>
      </div>

      {validation.metadata && (
        <div className="space-y-2 mb-4">
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="font-medium">Format:</span> {validation.metadata.format}
            </div>
            <div>
              <span className="font-medium">Size:</span> {validation.metadata.size[0]}x{validation.metadata.size[1]}
            </div>
            <div>
              <span className="font-medium">File Size:</span> {formatFileSize(validation.metadata.file_size)}
            </div>
            {validation.metadata.creation_time && (
              <div>
                <span className="font-medium">Created:</span> {formatDate(validation.metadata.creation_time)}
              </div>
            )}
          </div>

          {/* EXIF Data Summary */}
          {Object.keys(validation.metadata.exif_data).length > 0 && (
            <div className="mt-3 p-2 bg-gray-50 rounded text-xs">
              <div className="flex items-center gap-1 mb-1">
                <Camera className="w-3 h-3" />
                <span className="font-medium">Camera Info:</span>
              </div>
              <div className="grid grid-cols-2 gap-2">
                {validation.metadata.exif_data.Make && (
                  <div>Make: {validation.metadata.exif_data.Make}</div>
                )}
                {validation.metadata.exif_data.Model && (
                  <div>Model: {validation.metadata.exif_data.Model}</div>
                )}
                {Object.keys(validation.metadata.exif_data).some(key => key.includes('GPS')) && (
                  <div className="flex items-center gap-1 text-green-600">
                    <MapPin className="w-3 h-3" />
                    GPS Data Present
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Errors */}
      {validation.errors.length > 0 && (
        <div className="mb-3">
          <h4 className="font-medium text-red-600 mb-2">❌ Errors:</h4>
          <ul className="space-y-1">
            {validation.errors.map((error, index) => (
              <li key={index} className="text-sm text-red-600 bg-red-50 p-2 rounded">
                {error}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Warnings */}
      {validation.warnings.length > 0 && (
        <div>
          <h4 className="font-medium text-yellow-600 mb-2">⚠️ Warnings:</h4>
          <ul className="space-y-1">
            {validation.warnings.map((warning, index) => (
              <li key={index} className="text-sm text-yellow-600 bg-yellow-50 p-2 rounded">
                {warning}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export default ImageValidationDisplay; 