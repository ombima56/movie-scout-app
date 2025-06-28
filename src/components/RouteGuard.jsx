import { useParams, Navigate } from "react-router-dom";
import { useEffect } from "react";

/**
 * RouteGuard component to validate route parameters and prevent malicious inputs
 */
const RouteGuard = ({ children, paramName = "id" }) => {
  const params = useParams();
  const paramValue = params[paramName];

  useEffect(() => {
    // Log suspicious activity for monitoring
    if (paramValue && !isValidId(paramValue)) {
      console.warn(`Suspicious route parameter detected: ${paramValue}`);
      // In production, you might want to send this to a monitoring service
    }
  }, [paramValue]);

  // Validate the ID parameter
  const isValidId = (id) => {
    if (!id) return false;
    
    // Check if it's a valid number (TMDB IDs are numeric)
    const numericId = parseInt(id, 10);
    if (isNaN(numericId)) return false;
    
    // TMDB IDs are positive integers, typically not longer than 8 digits
    if (numericId <= 0 || numericId > 99999999) return false;
    
    // Check for common injection patterns
    const suspiciousPatterns = [
      /[<>'"]/,           // HTML/JS injection
      /\.\./,             // Path traversal
      /[;&|`$]/,          // Command injection
      /script/i,          // Script tags
      /javascript:/i,     // JavaScript protocol
      /data:/i,           // Data URLs
      /vbscript:/i,       // VBScript
      /on\w+=/i,          // Event handlers
    ];
    
    return !suspiciousPatterns.some(pattern => pattern.test(id));
  };

  // If ID is invalid, redirect to 404
  if (paramValue && !isValidId(paramValue)) {
    return <Navigate to="/404" replace />;
  }

  return children;
};

export default RouteGuard;
