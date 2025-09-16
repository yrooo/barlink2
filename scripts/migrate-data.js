const { MongoClient } = require('mongodb');
const { createClient } = require('@supabase/supabase-js');
const bcrypt = require('bcryptjs');
require('dotenv').config({ path: '.env.local' });

// MongoDB connection
const MONGODB_URI = process.env.MONGODB_URI;
const mongoClient = new MongoClient(MONGODB_URI);

// Supabase connection
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function migrateUsers() {
  console.log('Starting user migration...');
  
  try {
    const db = mongoClient.db();
    const users = await db.collection('users').find({}).toArray();
    
    console.log(`Found ${users.length} users to migrate`);
    
    for (const user of users) {
      const userData = {
        id: user._id.toString(),
        email: user.email,
        name: user.name,
        role: user.role,
        company: user.company || null,
        description: user.description || null,
        website: user.website || null,
        location: user.location || null,
        whatsapp_number: user.whatsappNumber || null,
        whatsapp_verified: user.whatsappVerified || false,
        whatsapp_verified_at: user.whatsappVerifiedAt || null,
        phone: user.profile?.phone || null,
        bio: user.profile?.bio || null,
        password_hash: user.password, // Already hashed in MongoDB
        email_verified: user.emailVerified || false,
        created_at: user.createdAt || new Date().toISOString(),
        updated_at: user.updatedAt || new Date().toISOString()
      };
      
      const { error } = await supabase
        .from('users')
        .upsert(userData, { onConflict: 'id' });
      
      if (error) {
        console.error(`Error migrating user ${user.email}:`, error);
      } else {
        console.log(`Migrated user: ${user.email}`);
      }
    }
    
    console.log('User migration completed');
  } catch (error) {
    console.error('Error in user migration:', error);
  }
}

async function migrateJobs() {
  console.log('Starting job migration...');
  
  try {
    const db = mongoClient.db();
    const jobs = await db.collection('jobs').find({}).toArray();
    
    console.log(`Found ${jobs.length} jobs to migrate`);
    
    for (const job of jobs) {
      const jobData = {
        id: job._id.toString(),
        title: job.title,
        company: job.company,
        description: job.description,
        location: job.location || null,
        salary: job.salary || null,
        employer_id: job.employerId.toString(),
        custom_questions: job.customQuestions || [],
        applications_count: job.applicationsCount || 0,
        status: job.status || 'active',
        created_at: job.createdAt || new Date().toISOString(),
        updated_at: job.updatedAt || new Date().toISOString()
      };
      
      const { error } = await supabase
        .from('jobs')
        .upsert(jobData, { onConflict: 'id' });
      
      if (error) {
        console.error(`Error migrating job ${job.title}:`, error);
      } else {
        console.log(`Migrated job: ${job.title}`);
      }
    }
    
    console.log('Job migration completed');
  } catch (error) {
    console.error('Error in job migration:', error);
  }
}

async function migrateApplications() {
  console.log('Starting application migration...');
  
  try {
    const db = mongoClient.db();
    const applications = await db.collection('applications').find({}).toArray();
    
    console.log(`Found ${applications.length} applications to migrate`);
    
    for (const application of applications) {
      const applicationData = {
        id: application._id.toString(),
        job_id: application.jobId.toString(),
        applicant_id: application.applicantId.toString(),
        employer_id: application.employerId.toString(),
        status: application.status || 'pending',
        notes: application.notes || null,
        created_at: application.createdAt || new Date().toISOString(),
        updated_at: application.updatedAt || new Date().toISOString()
      };
      
      const { data: insertedApp, error: appError } = await supabase
        .from('applications')
        .upsert(applicationData, { onConflict: 'id' })
        .select()
        .single();
      
      if (appError) {
        console.error(`Error migrating application ${application._id}:`, appError);
        continue;
      }
      
      // Migrate application answers if they exist
      if (application.answers && application.answers.length > 0) {
        for (const answer of application.answers) {
          const answerData = {
            application_id: insertedApp.id,
            question_id: answer.questionId,
            answer: answer.answer
          };
          
          const { error: answerError } = await supabase
            .from('application_answers')
            .upsert(answerData, { onConflict: 'application_id,question_id' });
          
          if (answerError) {
            console.error(`Error migrating answer for application ${application._id}:`, answerError);
          }
        }
      }
      
      console.log(`Migrated application: ${application._id}`);
    }
    
    console.log('Application migration completed');
  } catch (error) {
    console.error('Error in application migration:', error);
  }
}

async function migrateInterviews() {
  console.log('Starting interview migration...');
  
  try {
    const db = mongoClient.db();
    const interviews = await db.collection('interviews').find({}).toArray();
    
    console.log(`Found ${interviews.length} interviews to migrate`);
    
    for (const interview of interviews) {
      const interviewData = {
        id: interview._id.toString(),
        application_id: interview.applicationId.toString(),
        interviewer_id: interview.interviewerId?.toString() || interview.employerId?.toString(),
        candidate_id: interview.candidateId?.toString() || interview.applicantId?.toString(),
        scheduled_at: interview.scheduledAt || interview.scheduledDate,
        type: interview.type || interview.interviewType || 'online',
        location: interview.location || null,
        meeting_link: interview.meetingLink || null,
        notes: interview.notes || null,
        status: interview.status || 'scheduled',
        created_at: interview.createdAt || new Date().toISOString(),
        updated_at: interview.updatedAt || new Date().toISOString()
      };
      
      const { error } = await supabase
        .from('interviews')
        .upsert(interviewData, { onConflict: 'id' });
      
      if (error) {
        console.error(`Error migrating interview ${interview._id}:`, error);
      } else {
        console.log(`Migrated interview: ${interview._id}`);
      }
    }
    
    console.log('Interview migration completed');
  } catch (error) {
    console.error('Error in interview migration:', error);
  }
}

async function main() {
  try {
    console.log('Starting data migration from MongoDB to Supabase...');
    
    // Connect to MongoDB
    await mongoClient.connect();
    console.log('Connected to MongoDB');
    
    // Run migrations in order (users first, then jobs, then applications, then interviews)
    await migrateUsers();
    await migrateJobs();
    await migrateApplications();
    await migrateInterviews();
    
    console.log('\n=== Migration Summary ===');
    
    // Get counts from Supabase
    const { count: userCount } = await supabase.from('users').select('*', { count: 'exact', head: true });
    const { count: jobCount } = await supabase.from('jobs').select('*', { count: 'exact', head: true });
    const { count: applicationCount } = await supabase.from('applications').select('*', { count: 'exact', head: true });
    const { count: interviewCount } = await supabase.from('interviews').select('*', { count: 'exact', head: true });
    
    console.log(`Users migrated: ${userCount}`);
    console.log(`Jobs migrated: ${jobCount}`);
    console.log(`Applications migrated: ${applicationCount}`);
    console.log(`Interviews migrated: ${interviewCount}`);
    
    console.log('\nData migration completed successfully!');
    
  } catch (error) {
    console.error('Migration failed:', error);
  } finally {
    await mongoClient.close();
    console.log('MongoDB connection closed');
  }
}

// Run the migration
if (require.main === module) {
  main().catch(console.error);
}

module.exports = { main };