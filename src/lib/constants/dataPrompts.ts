export const DATA_CATEGORIES = {
    USER_DATA: {
      label: 'User Profiles',
      description: 'Generate realistic user profile data with names, emails, and demographics',
      fields: ['full_name', 'email', 'age', 'gender', 'location', 'occupation']
    },
    ECOMMERCE: {
      label: 'E-commerce',
      description: 'Generate product and order data for e-commerce applications',
      fields: ['product_name', 'price', 'category', 'stock', 'rating', 'seller']
    },
    TRANSACTIONS: {
      label: 'Financial Transactions',
      description: 'Generate transaction data with amounts, dates, and categories',
      fields: ['transaction_id', 'amount', 'date', 'type', 'category', 'status']
    },
    INVENTORY: {
      label: 'Inventory',
      description: 'Generate inventory and stock management data',
      fields: ['item_id', 'name', 'quantity', 'location', 'supplier', 'last_restock']
    },
    EVENTS: {
      label: 'Events',
      description: 'Generate event data with dates, venues, and attendance',
      fields: ['event_name', 'date', 'venue', 'capacity', 'ticket_price', 'organizer']
    },
    WEATHER: {
      label: 'Weather Data',
      description: 'Generate weather measurements and forecasts',
      fields: ['date', 'temperature', 'humidity', 'precipitation', 'wind_speed', 'conditions']
    },
    HEALTHCARE: {
      label: 'Healthcare',
      description: 'Generate patient and medical record data',
      fields: ['patient_id', 'admission_date', 'diagnosis', 'treatment', 'doctor', 'department']
    },
    REAL_ESTATE: {
      label: 'Real Estate',
      description: 'Generate property listing and sale data',
      fields: ['property_id', 'type', 'price', 'location', 'size', 'bedrooms', 'status']
    },
    EDUCATION: {
      label: 'Education',
      description: 'Generate student and course data',
      fields: ['student_id', 'course', 'grade', 'semester', 'instructor', 'credits']
    },
    HR_DATA: {
      label: 'HR Records',
      description: 'Generate employee and HR-related data',
      fields: ['employee_id', 'department', 'position', 'salary', 'hire_date', 'status']
    }
  } as const;
  
  type Category = keyof typeof DATA_CATEGORIES;
  
  /**
   * Generates a template reference prompt for users to understand how data generation works.
   */
  export function getTemplateReferencePrompt(): string {
    return `Welcome to the Data Generator! Here's how you can use this tool:
  
  1. **Select a Category**: Choose a data category from the available options (e.g., User Profiles, E-commerce, Financial Transactions, etc.).
  2. **Customize Fields**: Each category has predefined fields that you can use to generate data. You can also add or modify fields as needed.
  3. **Generate Data**: Once you've selected a category and customized the fields, click "Generate Data" to create realistic and structured data.
  4. **Export Data**: Export the generated data in your preferred format (e.g., JSON, CSV).
  
  Here’s an example of how to use the tool:
  
  - **Category**: User Profiles
  - **Fields**: full_name, email, age, gender, location, occupation
  - **Generated Data**:
    {
      "full_name": "John Doe",
      "email": "john.doe@example.com",
      "age": 30,
      "gender": "Male",
      "location": "New York, USA",
      "occupation": "Software Engineer"
    }
  
  Feel free to explore other categories and customize the fields to suit your needs!`;
  }
  
  /**
   * Generates a prompt for a specific data category.
   */
  export function getCategoryPrompt(category: Category): string {
    const cat = DATA_CATEGORIES[category];
    return `Generate ${category.toLowerCase()} with the following fields: ${cat.fields.join(', ')}. 
  Ensure data is realistic and follows standard patterns for ${cat.description.toLowerCase()}.
  Include appropriate relationships between fields and maintain data consistency.`;
  }