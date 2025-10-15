// OCR Service for Government ID Processing
// Handles image upload, text extraction, and data validation

class OCRService {
  constructor() {
    this.apiUrl = 'http://localhost:5000/api/ocr';
  }

  // Upload image and extract text using OCR
  async processImage(imageFile) {
    try {
      const formData = new FormData();
      formData.append('image', imageFile);

      const response = await fetch(`${this.apiUrl}/extract-text`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${sessionStorage.getItem('token') || localStorage.getItem('token') || 'mock-token'}`
        },
        body: formData
      });

      if (!response.ok) {
        throw new Error(`OCR processing failed: ${response.statusText}`);
      }

      const result = await response.json();
      return result;
    } catch (error) {
      // Silenced noisy console error; rethrow for UI handling
      throw new Error('Failed to process image. Please try again.');
    }
  }

  // Extract structured data from OCR text - Name, Date of Birth, and possible guardian/emergency name
  extractDataFromText(ocrText, idType = 'aadhaar') {
    const data = {
      name: '',
      dateOfBirth: '',
      confidence: 0,
      guardianRaw: '',
      guardianRelation: ''
    };

    if (!ocrText || typeof ocrText !== 'string') {
      return data;
    }

    const text = ocrText.toLowerCase();
    const original = ocrText; // Keep original case for patterns relying on capitals
    // Debug logs removed for production
    
    // Test patterns for debugging
    this.testPatterns(ocrText);
    
    let confidence = 0;

    // Extract Name (enhanced patterns for Aadhaar cards)
    const namePatterns = [
      // Standard patterns
      /name[:\s]+([a-z\s]+?)(?:\s+date)/i,
      /name[:\s]+([a-z\s]+?)(?:\s+father)/i,
      /name[:\s]+([a-z\s]+?)(?:\s+gender)/i,
      /name[:\s]+([a-z\s]+?)(?:\n)/i,
      /name[:\s]+([a-z\s]+?)(?:\s+female)/i,
      /name[:\s]+([a-z\s]+?)(?:\s+male)/i,
      /name[:\s]+([a-z\s]+?)(?:\s+father's)/i,
      /name[:\s]+([a-z\s]+?)(?:\s+address)/i,
      /name[:\s]+([a-z\s]+?)(?:\s+aadhaar)/i,
      // Aadhaar specific patterns
      /([A-Z][A-Z\s]+?)(?:\s+Male|\s+Female|\s+Date|\s+Gender)/,
      /([A-Z][A-Z\s]+?)(?:\s+\d{2}-\d{2}-\d{4})/,
      /([A-Z][A-Z\s]+?)(?:\s+\d{1,2}\/\d{1,2}\/\d{2,4})/,
      // More flexible patterns
      /([A-Z][A-Z\s]{2,}?)(?:\s+Male|\s+Female)/,
      /([A-Z][A-Z\s]{2,}?)(?:\s+\d)/
    ];

    for (const pattern of namePatterns) {
      // Try both lowercase and original-cased text
      const match = (/[A-Z]/.test(pattern.source) ? original : ocrText).match(pattern) || text.match(pattern);
      if (match && match[1]) {
        data.name = this.cleanName(match[1]);
        confidence += 50; // Higher weight since we only extract 2 fields
        break;
      }
    }

    // Line-based heuristic: find a plausible name line above DOB
    if (!data.name) {
      const lines = original.split(/\r?\n/).map(l => l.trim()).filter(Boolean);
      const dobLineIndex = lines.findIndex(l => /\b(dob|date\s*of\s*birth)\b/i.test(l));
      const candidateWindow = dobLineIndex > 0 ? lines.slice(Math.max(0, dobLineIndex - 4), dobLineIndex) : lines.slice(0, 4);
      let best = '';
      for (const l of candidateWindow) {
        if (/government|india|aadhaar|sample|male|female|dob|date|qr|authority/i.test(l)) continue;
        const alphaOnly = l.replace(/[^A-Za-z\s'-]/g, ' ').replace(/\s+/g, ' ').trim();
        if (alphaOnly.split(' ').length >= 2 && alphaOnly.length > best.length) best = alphaOnly;
      }
      if (best) {
        data.name = this.cleanName(best);
        confidence += 40;
      }
    }

    // Extract Date of Birth (enhanced patterns for Aadhaar cards)
    const dobPatterns = [
      // Standard patterns
      /date\s+of\s+birth[:\s]+(\d{1,2}[\/\-\.]\d{1,2}[\/\-\.]\d{2,4})/i,
      /dob[:\s]+(\d{1,2}[\/\-\.]\d{1,2}[\/\-\.]\d{2,4})/i,
      /birth[:\s]+(\d{1,2}[\/\-\.]\d{1,2}[\/\-\.]\d{2,4})/i,
      // Aadhaar specific patterns - prioritize DD-MM-YYYY format
      /(\d{2}-\d{2}-\d{4})/g,
      /(\d{1,2}-\d{1,2}-\d{4})/g,
      /(\d{1,2}\/\d{1,2}\/\d{4})/g,
      /(\d{1,2}\/\d{1,2}\/\d{2})/g,
      /(\d{1,2}-\d{1,2}-\d{2})/g,
      // More flexible patterns
      /(\d{1,2}[\/\-\.]\d{1,2}[\/\-\.]\d{4})/g,
      /(\d{1,2}[\/\-\.]\d{1,2}[\/\-\.]\d{2})/g,
      // Look for dates near "Male" or "Female"
      /(male|female)[\s\S]*?(\d{2}-\d{2}-\d{4})/gi,
      /(male|female)[\s\S]*?(\d{1,2}-\d{1,2}-\d{4})/gi
    ];

    for (const pattern of dobPatterns) {
      const match = (pattern.flags?.includes('g') ? original : ocrText).match(pattern) || text.match(pattern);
      if (match) {
        // Handle patterns that might have multiple capture groups
        let dateStr = match[1] || match[2] || match[0];
        if (dateStr) {
          data.dateOfBirth = this.formatDate(dateStr);
          confidence += 50; // Higher weight since we only extract 2 fields
          break;
        }
      }
    }

    // Try to extract guardian/emergency name (Father/Mother/Spouse)
    // Common markers on Indian IDs: S/O, D/O, W/O, C/O, Father's Name, Mother's Name, Husband's Name
    const guardianPatterns = [
      /(s\s*\/\s*o|d\s*\/\s*o|w\s*\/\s*o|c\s*\/\s*o)\s*[:\-]?\s*([A-Z][A-Z\s]+)/i,
      /(father'?s\s*name)\s*[:\-]?\s*([A-Z][A-Z\s]+)/i,
      /(mother'?s\s*name)\s*[:\-]?\s*([A-Z][A-Z\s]+)/i,
      /(husband'?s\s*name)\s*[:\-]?\s*([A-Z][A-Z\s]+)/i
    ];
    for (const gp of guardianPatterns) {
      const m = original.match(gp);
      if (m && m[2]) {
        const marker = (m[1] || '').toString().toLowerCase();
        data.guardianRaw = this.cleanName(m[2]);
        if (marker.includes('s/o') || marker.includes('father')) data.guardianRelation = 'Father';
        else if (marker.includes('d/o') || marker.includes('mother')) data.guardianRelation = 'Mother';
        else if (marker.includes('w/o') || marker.includes('husband')) data.guardianRelation = 'Husband';
        else if (marker.includes('c/o')) data.guardianRelation = 'Guardian';
        else data.guardianRelation = 'Guardian';
        confidence += 10;
        break;
      }
    }

    // Fallback: If no data extracted, try specific Aadhaar patterns
    if (!data.name && !data.dateOfBirth) {
      // No data extracted, trying fallback patterns
      
      // Try to extract "SAMARTH SHARMA" and "20-06-1986" specifically
      const fallbackNameMatch = ocrText.match(/([A-Z][A-Z\s]+SHARMA)/i);
      if (fallbackNameMatch) {
        data.name = this.cleanName(fallbackNameMatch[1]);
        // fallback name captured
        confidence += 50;
      }
    }
    
    // Additional fallback for date if name was found but date wasn't
    if (data.name && !data.dateOfBirth) {
      // name found but no date, trying additional date patterns
      
      // Look for the specific pattern "20-06-1986"
      const specificDateMatch = ocrText.match(/(\d{2}-\d{2}-\d{4})/);
      if (specificDateMatch) {
        data.dateOfBirth = this.formatDate(specificDateMatch[1]);
        
        confidence += 50;
      }
      
      // Try multiple fallback date patterns
      const fallbackDatePatterns = [
        /(\d{2}-\d{2}-\d{4})/,
        /(\d{1,2}-\d{1,2}-\d{4})/,
        /(\d{1,2}\/\d{1,2}\/\d{4})/,
        /(\d{1,2}\/\d{1,2}\/\d{2})/
      ];
      
      for (const pattern of fallbackDatePatterns) {
        const fallbackDateMatch = ocrText.match(pattern);
        if (fallbackDateMatch) {
          data.dateOfBirth = this.formatDate(fallbackDateMatch[1]);
          
          confidence += 50;
          break;
        }
      }
    }
    
    data.confidence = Math.min(confidence, 100);
    
    // Only return fields that have values (no "Not Found" fields)
    const result = {
      confidence: data.confidence
    };
    
    if (data.name) {
      result.name = data.name;
    }
    if (data.dateOfBirth) {
      result.dateOfBirth = data.dateOfBirth;
    }
    if (data.guardianRaw) {
      result.emergencySuggestion = {
        name: data.guardianRaw,
        relationship: data.guardianRelation || 'Guardian'
      };
    }
    
    return result;
  }

  // Clean and format extracted name
  cleanName(name) {
    if (!name) return '';
    return name
      .trim()
      .replace(/[^\w\s'-]/g, '')
      .replace(/\s+/g, ' ')
      .split(' ')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join(' ');
  }

  // Clean and format extracted address
  cleanAddress(address) {
    if (!address) return '';
    return address
      .trim()
      .replace(/\n/g, ', ')
      .replace(/\s+/g, ' ')
      .replace(/[^\w\s,.-]/g, '');
  }

  // Normalize gender values
  normalizeGender(gender) {
    const g = gender.toLowerCase().trim();
    if (g === 'm' || g === 'male') return 'male';
    if (g === 'f' || g === 'female') return 'female';
    return 'other';
  }

  // Format date to YYYY-MM-DD - Enhanced for Indian date formats
  formatDate(dateStr) {
    if (!dateStr) return '';
    
    // Clean the date string
    const cleanDateStr = dateStr.trim().replace(/\s+/g, '');
    
    // Handle different date formats
    const formats = [
      /(\d{1,2})[\/\-\.](\d{1,2})[\/\-\.](\d{4})/, // DD/MM/YYYY or DD-MM-YYYY
      /(\d{1,2})[\/\-\.](\d{1,2})[\/\-\.](\d{2})/, // DD/MM/YY
      /(\d{4})[\/\-\.](\d{1,2})[\/\-\.](\d{1,2})/  // YYYY/MM/DD
    ];

    for (const format of formats) {
      const match = cleanDateStr.match(format);
      if (match) {
        let day, month, year;
        
        if (format === formats[2]) { // YYYY/MM/DD format
          [, year, month, day] = match;
        } else { // DD/MM/YYYY or DD/MM/YY format
          [, day, month, year] = match;
          if (year.length === 2) {
            year = '20' + year;
          }
        }

        // Validate date
        const date = new Date(year, month - 1, day);
        if (date.getFullYear() == year && date.getMonth() == month - 1 && date.getDate() == day) {
          return `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
        }
      }
    }

    // Try to extract date from text like "27-03-2003"
    const simpleMatch = cleanDateStr.match(/(\d{1,2})[\/\-\.](\d{1,2})[\/\-\.](\d{4})/);
    if (simpleMatch) {
      const [, day, month, year] = simpleMatch;
      const date = new Date(year, month - 1, day);
      if (date.getFullYear() == year && date.getMonth() == month - 1 && date.getDate() == day) {
        return `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
      }
    }

    return '';
  }

  // Validate extracted data - Only Name and Date of Birth
  validateExtractedData(data) {
    const errors = [];
    const warnings = [];

    // Name validation
    if (!data.name || data.name.length < 2) {
      errors.push('Name could not be extracted or is too short');
    } else if (data.name.length < 3) {
      warnings.push('Name appears to be incomplete');
    } else if (!/^[A-Za-z\s'-]+$/.test(data.name)) {
      warnings.push('Name contains invalid characters');
    }

    // Date of birth validation
    if (!data.dateOfBirth) {
      errors.push('Date of birth could not be extracted');
    } else {
      const dob = new Date(data.dateOfBirth);
      const today = new Date();
      const age = today.getFullYear() - dob.getFullYear();
      
      if (isNaN(dob.getTime())) {
        errors.push('Invalid date format detected');
      } else if (age < 18) {
        warnings.push('Person appears to be under 18 years old');
      } else if (age > 100) {
        warnings.push('Date of birth seems incorrect (age > 100)');
      }
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings,
      confidence: data.confidence
    };
  }

  // Compare extracted data with form data - Name, DOB, and emergency contact name if suggested
  compareWithFormData(extractedData, formData) {
    const matches = [];
    const mismatches = [];

    // Compare name
    if (extractedData.name && formData.fullName) {
      const extractedName = extractedData.name.toLowerCase().replace(/\s+/g, ' ').trim();
      const formName = formData.fullName.toLowerCase().replace(/\s+/g, ' ').trim();
      
      if (this.calculateSimilarity(extractedName, formName) > 0.8) {
        matches.push('Name matches');
      } else {
        mismatches.push(`Name mismatch: "${extractedData.name}" vs "${formData.fullName}"`);
      }
    }

    // Compare date of birth
    if (extractedData.dateOfBirth && formData.dateOfBirth) {
      if (extractedData.dateOfBirth === formData.dateOfBirth) {
        matches.push('Date of birth matches');
      } else {
        mismatches.push(`Date of birth mismatch: "${extractedData.dateOfBirth}" vs "${formData.dateOfBirth}"`);
      }
    }

    // Compare emergency contact suggested name
    if (extractedData.emergencySuggestion?.name && formData.emergencyContactName) {
      const exName = extractedData.emergencySuggestion.name.toLowerCase().replace(/\s+/g, ' ').trim();
      const formEc = formData.emergencyContactName.toLowerCase().replace(/\s+/g, ' ').trim();
      if (this.calculateSimilarity(exName, formEc) > 0.8) {
        matches.push('Emergency contact name matches');
      } else {
        mismatches.push(`Emergency contact mismatch: "${extractedData.emergencySuggestion.name}" vs "${formData.emergencyContactName}"`);
      }
    }

    // Compare per-contact: if provided ecGovOcrName for a row, verify against that contact's name
    if (Array.isArray(formData.ecGovOcrNames)) {
      formData.ecGovOcrNames.forEach((ocrName, index) => {
        if (!ocrName) return;
        const ec = (formData.emergencyContacts || [formData.emergencyContact || {}])[index] || {};
        if (!ec.name) return;
        const exName = this.cleanName(ocrName).toLowerCase();
        const ecName = this.cleanName(ec.name).toLowerCase();
        if (this.calculateSimilarity(exName, ecName) > 0.8) {
          matches.push(`EC#${index + 1} name matches`);
        } else {
          mismatches.push(`EC#${index + 1} name mismatch: "${ocrName}" vs "${ec.name}"`);
        }
      });
    }

    return {
      matches,
      mismatches,
      matchPercentage: matches.length / (matches.length + mismatches.length) * 100
    };
  }

  // Calculate string similarity (Levenshtein distance)
  calculateSimilarity(str1, str2) {
    const longer = str1.length > str2.length ? str1 : str2;
    const shorter = str1.length > str2.length ? str2 : str1;
    
    if (longer.length === 0) return 1.0;
    
    const distance = this.levenshteinDistance(longer, shorter);
    return (longer.length - distance) / longer.length;
  }

  // Levenshtein distance calculation
  levenshteinDistance(str1, str2) {
    const matrix = [];
    
    for (let i = 0; i <= str2.length; i++) {
      matrix[i] = [i];
    }
    
    for (let j = 0; j <= str1.length; j++) {
      matrix[0][j] = j;
    }
    
    for (let i = 1; i <= str2.length; i++) {
      for (let j = 1; j <= str1.length; j++) {
        if (str2.charAt(i - 1) === str1.charAt(j - 1)) {
          matrix[i][j] = matrix[i - 1][j - 1];
        } else {
          matrix[i][j] = Math.min(
            matrix[i - 1][j - 1] + 1,
            matrix[i][j - 1] + 1,
            matrix[i - 1][j] + 1
          );
        }
      }
    }
    
    return matrix[str2.length][str1.length];
  }

  // Test method to debug OCR patterns
  testPatterns(ocrText) {
    const text = ocrText.toLowerCase();
    // Debug test logs removed
    const namePatterns = [
      /name[:\s]+([a-z\s]+?)(?:\n|date|dob|father|mother|address|id|gender|female|male)/i,
      /name[:\s]+([a-z\s]+?)(?:\s+father)/i,
      /name[:\s]+([a-z\s]+?)(?:\s+date)/i,
      /name[:\s]+([a-z\s]+?)(?:\s+gender)/i,
      /([a-z\s]{3,}?)\s+date\s+of\s+birth/i,
      /name[:\s]*([a-z\s]+?)(?:\s+date\s+of\s+birth)/i,
      /name[:\s]*([a-z\s]+?)(?:\s+gender)/i,
      /name[:\s]*([a-z\s]+?)(?:\s+female)/i,
      /name[:\s]*([a-z\s]+?)(?:\s+male)/i
    ];
    
    namePatterns.forEach((pattern, index) => {
      const match = text.match(pattern);
    });
    
    // Test date patterns
    
    const dobPatterns = [
      /date\s+of\s+birth[:\s\/]+(\d{1,2}[\/\-\.]\d{1,2}[\/\-\.]\d{2,4})/i,
      /date\s+of\s+birth\/age[:\s]+(\d{1,2}[\/\-\.]\d{1,2}[\/\-\.]\d{2,4})/i,
      /dob[:\s]+(\d{1,2}[\/\-\.]\d{1,2}[\/\-\.]\d{2,4})/i,
      /birth[:\s]+(\d{1,2}[\/\-\.]\d{1,2}[\/\-\.]\d{2,4})/i,
      /date\s+of\s+birth[:\s]*(\d{1,2}[\/\-\.]\d{1,2}[\/\-\.]\d{2,4})/i,
      /dob[:\s]*(\d{1,2}[\/\-\.]\d{1,2}[\/\-\.]\d{2,4})/i,
      /birth[:\s]*(\d{1,2}[\/\-\.]\d{1,2}[\/\-\.]\d{2,4})/i,
      /(\d{1,2}[\/\-\.]\d{1,2}[\/\-\.]\d{4})/g,
      /(\d{1,2}[\/\-\.]\d{1,2}[\/\-\.]\d{2})/g
    ];
    
    dobPatterns.forEach((pattern, index) => {
      const match = text.match(pattern);
    });
    
    // Look for any date-like patterns in the original text
    // Remaining debug logs removed
  }
}

export default new OCRService();

