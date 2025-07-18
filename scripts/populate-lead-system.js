// Script to populate the lead capture system with sample data
import { db } from '../server/db.ts';
import { 
  leadMagnets, 
  leadForms, 
  leadFormAssignments 
} from '../shared/schema.ts';

async function populateLeadSystem() {
  console.log('Populating lead capture system with sample data...');

  try {
    // Create sample lead magnets
    const leadMagnetData = [
      {
        slug: 'productivity-toolkit',
        title: 'The Ultimate Productivity Toolkit',
        description: 'A comprehensive collection of templates, checklists, and tools to boost your productivity by 300%.',
        type: 'toolkit',
        deliveryMethod: 'email',
        deliveryUrl: null,
        deliveryConfig: {
          emailTemplate: 'productivity-toolkit-template',
          followUpSequence: true,
          deliveryDelay: 0
        },
        isActive: true
      },
      {
        slug: 'affiliate-marketing-ebook',
        title: 'The Complete Affiliate Marketing Guide',
        description: 'Learn the exact strategies I used to make $100k+ per year with affiliate marketing.',
        type: 'ebook',
        deliveryMethod: 'download',
        deliveryUrl: '/downloads/affiliate-marketing-guide.pdf',
        deliveryConfig: {
          downloadExpiry: 7,
          trackDownloads: true
        },
        isActive: true
      },
      {
        slug: 'lead-generation-checklist',
        title: '47-Point Lead Generation Checklist',
        description: 'The exact checklist I use to generate 1000+ qualified leads every month.',
        type: 'checklist',
        deliveryMethod: 'email',
        deliveryUrl: null,
        deliveryConfig: {
          emailTemplate: 'lead-generation-checklist-template',
          followUpSequence: true,
          deliveryDelay: 0
        },
        isActive: true
      },
      {
        slug: 'conversion-optimization-course',
        title: 'Free 5-Day Conversion Optimization Course',
        description: 'Master the art of converting visitors into customers with this free email course.',
        type: 'course',
        deliveryMethod: 'email',
        deliveryUrl: null,
        deliveryConfig: {
          emailTemplate: 'conversion-course-template',
          followUpSequence: true,
          deliveryDelay: 0,
          courseLength: 5
        },
        isActive: true
      }
    ];

    // Insert lead magnets
    const insertedMagnets = await db.insert(leadMagnets).values(leadMagnetData).returning();
    console.log(`✓ Created ${insertedMagnets.length} lead magnets`);

    // Create sample lead forms
    const leadFormData = [
      {
        slug: 'productivity-popup',
        title: 'Get Your Free Productivity Toolkit',
        description: 'Enter your email to receive the ultimate productivity toolkit that will transform your workflow.',
        leadMagnetId: insertedMagnets[0].id,
        formType: 'popup',
        triggerConfig: {
          delaySeconds: 30,
          scrollPercentage: 50,
          exitIntent: true
        },
        formFields: {
          email: { required: true, label: 'Email Address', placeholder: 'Enter your email' },
          firstName: { required: true, label: 'First Name', placeholder: 'Your first name' },
          lastName: { required: false, label: 'Last Name', placeholder: 'Your last name' }
        },
        styling: {
          backgroundColor: '#ffffff',
          primaryColor: '#10B981',
          borderRadius: '12px',
          fontSize: '16px'
        },
        emotion: 'trust',
        isActive: true
      },
      {
        slug: 'affiliate-sidebar',
        title: 'Free Affiliate Marketing Guide',
        description: 'Discover the secrets to successful affiliate marketing.',
        leadMagnetId: insertedMagnets[1].id,
        formType: 'sidebar',
        triggerConfig: {
          alwaysVisible: true
        },
        formFields: {
          email: { required: true, label: 'Email Address', placeholder: 'Enter your email' },
          firstName: { required: true, label: 'First Name', placeholder: 'Your first name' }
        },
        styling: {
          backgroundColor: '#f8fafc',
          primaryColor: '#F59E0B',
          borderRadius: '8px',
          fontSize: '14px'
        },
        emotion: 'excitement',
        isActive: true
      },
      {
        slug: 'lead-generation-inline',
        title: 'Get the Lead Generation Checklist',
        description: 'The exact checklist that generates 1000+ leads per month.',
        leadMagnetId: insertedMagnets[2].id,
        formType: 'inline',
        triggerConfig: {
          alwaysVisible: true
        },
        formFields: {
          email: { required: true, label: 'Email Address', placeholder: 'Enter your email' },
          firstName: { required: true, label: 'First Name', placeholder: 'Your first name' },
          phone: { required: false, label: 'Phone Number', placeholder: 'Your phone number' }
        },
        styling: {
          backgroundColor: '#ffffff',
          primaryColor: '#8B5CF6',
          borderRadius: '10px',
          fontSize: '16px'
        },
        emotion: 'relief',
        isActive: true
      },
      {
        slug: 'conversion-footer',
        title: 'Start Your Free Conversion Course',
        description: 'Learn how to convert more visitors into customers.',
        leadMagnetId: insertedMagnets[3].id,
        formType: 'footer',
        triggerConfig: {
          alwaysVisible: true
        },
        formFields: {
          email: { required: true, label: 'Email Address', placeholder: 'Enter your email' },
          firstName: { required: true, label: 'First Name', placeholder: 'Your first name' }
        },
        styling: {
          backgroundColor: '#ffffff',
          primaryColor: '#EF4444',
          borderRadius: '8px',
          fontSize: '16px'
        },
        emotion: 'confidence',
        isActive: true
      }
    ];

    // Insert lead forms
    const insertedForms = await db.insert(leadForms).values(leadFormData).returning();
    console.log(`✓ Created ${insertedForms.length} lead forms`);

    // Create sample lead form assignments
    const leadFormAssignmentData = [
      {
        leadFormId: insertedForms[0].id, // Productivity popup
        pageSlug: 'productivity-tools',
        position: 'popup',
        priority: 1,
        isActive: true
      },
      {
        leadFormId: insertedForms[1].id, // Affiliate sidebar
        pageSlug: 'affiliate-marketing-guide',
        position: 'sidebar',
        priority: 1,
        isActive: true
      },
      {
        leadFormId: insertedForms[2].id, // Lead generation inline
        pageSlug: 'lead-generation-strategies',
        position: 'inline',
        priority: 1,
        isActive: true
      },
      {
        leadFormId: insertedForms[3].id, // Conversion footer
        pageSlug: 'conversion-optimization',
        position: 'footer',
        priority: 1,
        isActive: true
      },
      // Add popup form to multiple pages
      {
        leadFormId: insertedForms[0].id, // Productivity popup
        pageSlug: 'time-management-tools',
        position: 'popup',
        priority: 1,
        isActive: true
      },
      {
        leadFormId: insertedForms[1].id, // Affiliate sidebar
        pageSlug: 'online-business-guide',
        position: 'sidebar',
        priority: 1,
        isActive: true
      }
    ];

    // Insert lead form assignments
    const insertedAssignments = await db.insert(leadFormAssignments).values(leadFormAssignmentData).returning();
    console.log(`✓ Created ${insertedAssignments.length} lead form assignments`);

    console.log('\n🎉 Successfully populated lead capture system!');
    console.log('\nSample data created:');
    console.log(`• ${insertedMagnets.length} lead magnets`);
    console.log(`• ${insertedForms.length} lead forms`);
    console.log(`• ${insertedAssignments.length} lead form assignments`);
    
    console.log('\nLead forms will now appear on the following pages:');
    console.log('• /page/productivity-tools - Popup form');
    console.log('• /page/affiliate-marketing-guide - Sidebar form');
    console.log('• /page/lead-generation-strategies - Inline form');
    console.log('• /page/conversion-optimization - Footer form');
    console.log('• /page/time-management-tools - Popup form');
    console.log('• /page/online-business-guide - Sidebar form');
    
    console.log('\nYou can view the lead management dashboard at:');
    console.log('• /admin/leads-dashboard');

  } catch (error) {
    console.error('Error populating lead capture system:', error);
  }
}

// Run the script
populateLeadSystem().catch(console.error);