// Test script to verify API endpoints are working correctly

const testVisitRule = async () => {
  const completeRule = {
    title: "Complete Test Visit Rule",
    description: "This is a comprehensive test rule with all fields filled",
    category: "family",
    rules: ["Visitors must arrive 15 minutes early", "Maximum 2 visitors per session", "No physical contact allowed"],
    restrictions: ["No food items", "No electronic devices", "No bags larger than 12 inches"],
    eligibilityCriteria: ["Good behavior record", "Completed orientation program", "No disciplinary actions in last 30 days"],
    prohibitedItems: ["Weapons", "Drugs", "Cell phones", "Cash", "Jewelry"],
    allowedVisitorTypes: ["Immediate family", "Legal counsel", "Religious advisors"],
    specialConditions: ["Supervised visits only", "Valid ID required", "Background check completed"],
    securityChecks: ["Metal detector scan", "Bag search", "ID verification", "Visitor registration"],
    visitingHours: {
      maxVisitsPerWeek: 3,
      maxVisitsPerMonth: 12,
      maxVisitDuration: 90,
      maxVisitorsPerSession: 4,
      minVisitorAge: 16
    },
    isActive: true
  };

  try {
    console.log('Sending complete rule data:', JSON.stringify(completeRule, null, 2));
    
    const response = await fetch('http://localhost:5000/api/admin/rules/visits', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer mock-token'
      },
      body: JSON.stringify(completeRule)
    });

    if (response.ok) {
      const result = await response.json();
      console.log('✅ Visit rule created successfully:', result);
      
      // Now fetch all rules to verify it was saved
      const getAllResponse = await fetch('http://localhost:5000/api/admin/rules/visits', {
        headers: {
          'Authorization': 'Bearer mock-token'
        }
      });
      
      if (getAllResponse.ok) {
        const allRules = await getAllResponse.json();
        console.log('📋 All visit rules:', allRules);
        
        // Find our newly created rule
        const newRule = allRules.rules.find(rule => rule.title === completeRule.title);
        if (newRule) {
          console.log('🔍 Found our new rule:', newRule);
          console.log('✅ All fields saved correctly!');
        } else {
          console.log('❌ Could not find our new rule');
        }
      }
    } else {
      console.error('❌ Failed to create rule:', response.status, await response.text());
    }
  } catch (error) {
    console.error('❌ Error:', error);
  }
};

const testPrisonRule = async () => {
  const completeRule = {
    title: "Complete Test Prison Rule",
    description: "This is a comprehensive test prison rule with all fields filled",
    category: "security",
    ruleNumber: "PR001",
    severity: "high",
    consequences: ["Written warning", "Loss of privileges", "Solitary confinement", "Extended sentence"],
    applicableBlocks: ["Block A", "Block B", "Block C"],
    isActive: true
  };

  try {
    console.log('Sending complete prison rule data:', JSON.stringify(completeRule, null, 2));
    
    const response = await fetch('http://localhost:5000/api/admin/rules/prison', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer mock-token'
      },
      body: JSON.stringify(completeRule)
    });

    if (response.ok) {
      const result = await response.json();
      console.log('✅ Prison rule created successfully:', result);
    } else {
      console.error('❌ Failed to create prison rule:', response.status, await response.text());
    }
  } catch (error) {
    console.error('❌ Error:', error);
  }
};

const testPrisoner = async () => {
  const completePrisoner = {
    firstName: "John",
    lastName: "Doe",
    middleName: "Michael",
    dateOfBirth: "1985-05-15",
    gender: "male",
    prisonerNumber: "P" + Date.now().toString().slice(-6),
    currentBlock: "Block A",
    securityLevel: "medium",
    charges: "Theft, Burglary, Assault",
    sentenceLength: "5 years",
    admissionDate: "2024-01-15",
    cellNumber: "A101",
    address: {
      street: "123 Main Street",
      city: "Springfield",
      state: "Illinois",
      pincode: "62701"
    },
    emergencyContact: {
      name: "Jane Doe",
      relationship: "Sister",
      phone: "555-0123"
    }
  };

  try {
    console.log('Sending complete prisoner data:', JSON.stringify(completePrisoner, null, 2));
    
    const response = await fetch('http://localhost:5000/api/admin/prisoners', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer mock-token'
      },
      body: JSON.stringify(completePrisoner)
    });

    if (response.ok) {
      const result = await response.json();
      console.log('✅ Prisoner created successfully:', result);
    } else {
      console.error('❌ Failed to create prisoner:', response.status, await response.text());
    }
  } catch (error) {
    console.error('❌ Error:', error);
  }
};

// Run all tests
console.log('🚀 Starting API tests...');
testVisitRule();
setTimeout(() => testPrisonRule(), 1000);
setTimeout(() => testPrisoner(), 2000);
