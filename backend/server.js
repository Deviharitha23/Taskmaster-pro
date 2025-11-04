// server.js - Fixed to use ES modules and Gmail instead of SendGrid
import express from 'express';
import cors from 'cors';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import mongoose from 'mongoose';
import nodemailer from 'nodemailer';
import nodeCron from 'node-cron';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

// Middleware
app.use(cors({
  origin: ["https://frontend-sage-seven-47.vercel.app"],
  methods: ["GET", "POST", "PUT", "DELETE"],
  credentials: true
}));

app.use(express.json());
app.get('/', (req, res) => {
  res.send('✅ Backend is running successfully on Render!');
});

// MongoDB Connection
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/taskmaster', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

// User Schema
const UserSchema = new mongoose.Schema({
  name: String,
  email: { type: String, unique: true },
  password: String,
  emailNotifications: { type: Boolean, default: true },
  taskReminders: { type: Boolean, default: true },
  weeklyDigest: { type: Boolean, default: true },
  productivityReports: { type: Boolean, default: true },
  reminderTime: { type: Number, default: 60 }, // Minutes before due date
  createdAt: { type: Date, default: Date.now }
});

const User = mongoose.model('User', UserSchema);

// Task Schema - Enhanced with notification tracking
const TaskSchema = new mongoose.Schema({
  title: String,
  description: String,
  dueDate: Date,
  priority: { type: String, enum: ['low', 'medium', 'high'] },
  status: { type: String, enum: ['pending', 'inProgress', 'completed'], default: 'pending' },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  notificationSent: { type: Boolean, default: false },
  lastNotificationDate: Date,
  emailNotification: { type: Boolean, default: true },
  createdAt: { type: Date, default: Date.now }
});

TaskSchema.index({ userId: 1, status: 1 });
TaskSchema.index({ dueDate: 1, status: 1 });

const Task = mongoose.model('Task', TaskSchema);

// Gmail Transporter Setup - Using your Gmail credentials
const createEmailTransporter = () => {
  if (process.env.EMAIL_USER && process.env.EMAIL_PASS) {
    console.log('📧 Configuring Gmail email service...');
    console.log('📧 Using email:', process.env.EMAIL_USER);
    
    return nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS.replace(/\s/g, '') // Remove spaces from app password
      }
    });
  } else {
    console.log('📧 Email not configured - running in DEVELOPMENT MODE');
    console.log('📧 To enable real emails, set EMAIL_USER and EMAIL_PASS in .env file');
    
    return {
      sendMail: async (mailOptions) => {
        console.log('📧 DEVELOPMENT MODE - Email would be sent:');
        console.log('📧 To:', mailOptions.to);
        console.log('📧 Subject:', mailOptions.subject);
        console.log('---');
        
        await new Promise(resolve => setTimeout(resolve, 1500));
        
        return { 
          messageId: 'dev-' + Date.now(),
          response: '250 OK - Development mode',
          accepted: [mailOptions.to]
        };
      },
      verify: (callback) => {
        console.log('📧 Development email transporter verified');
        callback(null, true);
      }
    };
  }
};

const emailTransporter = createEmailTransporter();

// Verify Gmail configuration
emailTransporter.verify((error, success) => {
  if (error) {
    console.log('❌ Gmail configuration error:', error.message);
    if (process.env.EMAIL_USER && process.env.EMAIL_PASS) {
      console.log('💡 Gmail TIPS:');
      console.log('   1. Make sure you\'re using an APP PASSWORD, not your regular Gmail password');
      console.log('   2. Enable 2-factor authentication on your Gmail account');
      console.log('   3. Generate app password at: https://myaccount.google.com/apppasswords');
      console.log('   4. Your app password should be 16 characters without spaces');
    }
  } else {
    if (process.env.EMAIL_USER && process.env.EMAIL_PASS) {
      console.log('✅ Gmail server is ready to send real emails!');
    } else {
      console.log('✅ Development email mode active - emails will be logged to console');
    }
  }
});

// Improved Send Email Notification Function for Gmail
async function sendEmailNotification(userEmail, subject, message) {
  try {
    const mailOptions = {
      from: `"TaskMaster Pro" <${process.env.EMAIL_USER || 'noreply@taskmaster.com'}>`,
      to: userEmail,
      subject: subject,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #e0e0e0; border-radius: 10px; overflow: hidden;">
          <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; text-align: center; color: white;">
            <h1 style="margin: 0; font-size: 28px;">TaskMaster Pro</h1>
            <p style="margin: 5px 0 0 0; opacity: 0.9;">Productivity Suite</p>
          </div>
          <div style="padding: 30px; background: #f8f9fa;">
            ${message}
          </div>
          <div style="background: #2d3748; padding: 20px; text-align: center; color: white;">
            <p style="margin: 0; font-size: 14px; opacity: 0.8;">&copy; 2024 TaskMaster Pro. All rights reserved.</p>
          </div>
        </div>
      `
    };

    const result = await emailTransporter.sendMail(mailOptions);
    
    if (process.env.EMAIL_USER && process.env.EMAIL_PASS) {
      console.log('✅ Real email sent via Gmail to:', userEmail);
      console.log('📧 Message ID:', result.messageId);
    } else {
      console.log('✅ Development email simulated for:', userEmail);
    }
    
    return true;
  } catch (error) {
    console.error('❌ Error sending email to', userEmail, ':', error.message);
    
    if (process.env.EMAIL_USER && process.env.EMAIL_PASS) {
      console.log('💡 Gmail failed, but operation continues...');
    }
    
    return false;
  }
}

// Enhanced Notification Functions (using Gmail)
const notificationService = {
  checkUpcomingTasks: async () => {
    try {
      console.log('🔔 Checking for upcoming tasks...');
      const users = await User.find({ emailNotifications: true, taskReminders: true });
      
      let sentCount = 0;
      
      for (const user of users) {
        const now = new Date();
        const reminderWindow = new Date(now.getTime() + (user.reminderTime || 60) * 60 * 1000);
        
        const upcomingTasks = await Task.find({
          userId: user._id,
          status: { $in: ['pending', 'inProgress'] },
          dueDate: {
            $gte: now,
            $lte: reminderWindow
          },
          notificationSent: { $ne: true },
          emailNotification: true
        });

        for (const task of upcomingTasks) {
          const subject = '⏰ Task Reminder - TaskMaster Pro';
          const message = `
            <h2 style="color: #2d3748; margin-bottom: 20px;">Upcoming Task Reminder</h2>
            <p style="color: #4a5568; margin-bottom: 15px;">Hello <strong>${user.name}</strong>,</p>
            <p style="color: #4a5568; margin-bottom: 20px;">This task is due soon:</p>
            <div style="background: white; padding: 20px; border-radius: 8px; border-left: 4px solid #f6e05e; margin: 20px 0;">
              <h3 style="margin: 0 0 10px 0; color: #2d3748;">${task.title}</h3>
              <p style="margin: 5px 0; color: #4a5568;"><strong>Due Date:</strong> ${new Date(task.dueDate).toLocaleString()}</p>
              <p style="margin: 5px 0; color: #4a5568;"><strong>Priority:</strong> <span style="text-transform: capitalize; color: ${
                task.priority === 'high' ? '#fc8181' : task.priority === 'medium' ? '#f6e05e' : '#68d391'
              };">${task.priority}</span></p>
              ${task.description ? `<p style="margin: 10px 0 0 0; color: #718096;">${task.description}</p>` : ''}
            </div>
            <p style="color: #4a5568;">Don't forget to complete this task on time!</p>
          `;
          
          const emailSent = await sendEmailNotification(user.email, subject, message);
          if (emailSent) {
            task.notificationSent = true;
            task.lastNotificationDate = new Date();
            await task.save();
            sentCount++;
          }
        }
      }

      console.log(`📧 Sent ${sentCount} upcoming task reminders via Gmail`);
      return sentCount;
    } catch (error) {
      console.error('Error checking upcoming tasks:', error);
      return 0;
    }
  },

  sendDailyDigest: async () => {
    try {
      console.log('📊 Sending daily task digest via Gmail...');
      const users = await User.find({ emailNotifications: true, weeklyDigest: true });
      
      let sentCount = 0;

      for (const user of users) {
        const pendingTasks = await Task.find({
          userId: user._id,
          status: { $in: ['pending', 'inProgress'] },
          dueDate: { $gte: new Date() }
        }).sort({ dueDate: 1 }).limit(10);

        if (pendingTasks.length > 0) {
          const taskList = pendingTasks.map(task => `
            <li style="margin-bottom: 15px; padding: 10px; background: white; border-radius: 5px;">
              <strong style="color: #2d3748;">${task.title}</strong><br/>
              <span style="color: #718096; font-size: 14px;">Due: ${new Date(task.dueDate).toLocaleDateString()} | Priority: ${task.priority}</span>
            </li>
          `).join('');

          const subject = '📊 Your Daily Task Summary - TaskMaster Pro';
          const message = `
            <h2 style="color: #2d3748; margin-bottom: 20px;">Your Tasks for Today</h2>
            <p style="color: #4a5568; margin-bottom: 15px;">Hello <strong>${user.name}</strong>,</p>
            <p style="color: #4a5568; margin-bottom: 20px;">You have <strong>${pendingTasks.length}</strong> pending task(s):</p>
            <ul style="list-style: none; padding: 0; margin: 20px 0;">
              ${taskList}
            </ul>
            <p style="color: #4a5568;">Stay productive and achieve your goals! 🚀</p>
          `;
          
          const emailSent = await sendEmailNotification(user.email, subject, message);
          if (emailSent) sentCount++;
        }
      }

      console.log(`📧 Sent ${sentCount} daily digests via Gmail`);
      return sentCount;
    } catch (error) {
      console.error('Error sending daily digest:', error);
      return 0;
    }
  },

  sendImmediateNotification: async (taskId, notificationType = 'reminder') => {
    try {
      const task = await Task.findById(taskId).populate('userId');
      
      if (!task || !task.userId || !task.userId.emailNotifications) {
        return false;
      }

      const user = task.userId;
      let subject, message;

      switch (notificationType) {
        case 'reminder':
          subject = '🔔 Task Reminder - TaskMaster Pro';
          message = `
            <h2 style="color: #2d3748; margin-bottom: 20px;">Task Reminder</h2>
            <p style="color: #4a5568; margin-bottom: 15px;">Hello <strong>${user.name}</strong>,</p>
            <div style="background: white; padding: 20px; border-radius: 8px; border-left: 4px solid #667eea; margin: 20px 0;">
              <h3 style="margin: 0 0 10px 0; color: #2d3748;">${task.title}</h3>
              <p style="margin: 5px 0; color: #4a5568;"><strong>Due Date:</strong> ${new Date(task.dueDate).toLocaleString()}</p>
              ${task.description ? `<p style="margin: 10px 0 0 0; color: #718096;">${task.description}</p>` : ''}
            </div>
          `;
          break;
        
        case 'urgent':
          subject = '🚨 Urgent Task Alert - TaskMaster Pro';
          message = `
            <h2 style="color: #fc8181; margin-bottom: 20px;">Urgent Task Alert!</h2>
            <p style="color: #4a5568; margin-bottom: 15px;">Hello <strong>${user.name}</strong>,</p>
            <div style="background: white; padding: 20px; border-radius: 8px; border-left: 4px solid #fc8181; margin: 20px 0;">
              <h3 style="margin: 0 0 10px 0; color: #2d3748;">${task.title}</h3>
              <p style="margin: 5px 0; color: #4a5568;"><strong>Due Date:</strong> ${new Date(task.dueDate).toLocaleString()}</p>
              ${task.description ? `<p style="margin: 10px 0 0 0; color: #718096;">${task.description}</p>` : ''}
            </div>
            <p style="color: #4a5568;">⚠️ This task requires immediate attention!</p>
          `;
          break;
        
        default:
          return false;
      }

      return await sendEmailNotification(user.email, subject, message);
    } catch (error) {
      console.error('Error sending immediate notification:', error);
      return false;
    }
  }
};

// Auth Middleware - MOVED BEFORE ROUTES
const authMiddleware = async (req, res, next) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    if (!token) {
      return res.status(401).json({ success: false, message: 'No token provided' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'taskmaster-secret-key-2024');
    const user = await User.findById(decoded.userId);
    if (!user) {
      return res.status(401).json({ success: false, message: 'Invalid token' });
    }

    req.user = user;
    next();
  } catch (error) {
    res.status(401).json({ success: false, message: 'Token is not valid' });
  }
};

// === ALL YOUR EXISTING ROUTES === //

// Get all users (if needed for your frontend)
app.get('/api/users', authMiddleware, async (req, res) => {
  try {
    const users = await User.find({}, 'name email createdAt');
    res.json({ success: true, users });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Get specific user by ID
app.get('/api/users/:id', authMiddleware, async (req, res) => {
  try {
    const user = await User.findById(req.params.id, 'name email createdAt');
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }
    res.json({ success: true, user });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Update user profile
app.put('/api/users/:id', authMiddleware, async (req, res) => {
  try {
    const { name, email } = req.body;
    const user = await User.findByIdAndUpdate(
      req.params.id,
      { name, email },
      { new: true }
    );
    res.json({ success: true, message: 'User updated successfully', user });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Get tasks with query parameters support
app.get('/api/tasks', authMiddleware, async (req, res) => {
  try {
    const { status, priority, search } = req.query;
    let query = { userId: req.user._id };

    // Add filters if provided
    if (status && status !== 'all') {
      query.status = status;
    }
    if (priority && priority !== 'all') {
      query.priority = priority;
    }
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      ];
    }

    const tasks = await Task.find(query).sort({ createdAt: -1 });
    res.json({ success: true, tasks });
  } catch (error) {
    console.error('Error fetching tasks:', error);
    res.status(500).json({ success: false, message: 'Server error fetching tasks' });
  }
});

// Create task (enhanced version)
app.post('/api/tasks', authMiddleware, async (req, res) => {
  try {
    const { title, description, dueDate, priority, status } = req.body;
    
    // Validate required fields
    if (!title || !dueDate) {
      return res.status(400).json({ 
        success: false, 
        message: 'Title and due date are required' 
      });
    }

    const task = new Task({
      title,
      description,
      dueDate: new Date(dueDate),
      priority: priority || 'medium',
      status: status || 'pending',
      userId: req.user._id
    });

    await task.save();

    // Send email notification if enabled
    if (req.user.emailNotifications && req.user.taskReminders) {
      const subject = 'New Task Created - TaskMaster Pro';
      const message = `
        <h2 style="color: #2d3748; margin-bottom: 20px;">New Task Created! 📝</h2>
        <p style="color: #4a5568; margin-bottom: 15px;">Hello <strong>${req.user.name}</strong>,</p>
        <p style="color: #4a5568; margin-bottom: 20px;">You've successfully created a new task:</p>
        <div style="background: white; padding: 20px; border-radius: 8px; border-left: 4px solid #667eea; margin: 20px 0;">
          <h3 style="margin: 0 0 10px 0; color: #2d3748;">${title}</h3>
          <p style="margin: 5px 0; color: #4a5568;"><strong>Description:</strong> ${description || 'No description provided'}</p>
          <p style="margin: 5px 0; color: #4a5568;"><strong>Due Date:</strong> ${new Date(dueDate).toLocaleDateString()}</p>
          <p style="margin: 5px 0; color: #4a5568;"><strong>Priority:</strong> <span style="text-transform: capitalize; color: ${
            priority === 'high' ? '#fc8181' : priority === 'medium' ? '#f6e05e' : '#68d391'
          };">${priority || 'medium'}</span></p>
        </div>
        <p style="color: #4a5568;">You'll receive a reminder ${req.user.reminderTime} minutes before the due date.</p>
        <p style="color: #4a5568;">Stay productive and keep achieving your goals! 🚀</p>
      `;
      
      await sendEmailNotification(req.user.email, subject, message);
    }

    res.json({ 
      success: true, 
      message: 'Task created successfully',
      task 
    });
  } catch (error) {
    console.error('Error creating task:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Server error creating task',
      error: error.message 
    });
  }
});

// Update task
app.put('/api/tasks/:id', authMiddleware, async (req, res) => {
  try {
    const { title, description, dueDate, priority, status } = req.body;
    const task = await Task.findOne({ _id: req.params.id, userId: req.user._id });
    
    if (!task) {
      return res.status(404).json({ success: false, message: 'Task not found' });
    }

    const oldStatus = task.status;
    
    // Update task fields
    if (title !== undefined) task.title = title;
    if (description !== undefined) task.description = description;
    if (dueDate !== undefined) task.dueDate = new Date(dueDate);
    if (priority !== undefined) task.priority = priority;
    if (status !== undefined) task.status = status;

    await task.save();

    // Send completion email if task was just completed
    if (status === 'completed' && oldStatus !== 'completed' && req.user.emailNotifications && req.user.taskReminders) {
      const subject = 'Task Completed! 🎉 - TaskMaster Pro';
      const message = `
        <h2 style="color: #2d3748; margin-bottom: 20px;">Congratulations! Task Completed! 🎉</h2>
        <p style="color: #4a5568; margin-bottom: 15px;">Hello <strong>${req.user.name}</strong>,</p>
        <p style="color: #4a5568; margin-bottom: 20px;">You've successfully completed a task! Great work!</p>
        <div style="background: white; padding: 20px; border-radius: 8px; border-left: 4px solid #68d391; margin: 20px 0;">
          <h3 style="margin: 0 0 10px 0; color: #2d3748;">${task.title}</h3>
          <p style="margin: 5px 0; color: #4a5568;">${task.description || 'No description provided'}</p>
          <p style="margin: 10px 0 0 0; color: #68d391; font-weight: bold;">✅ Completed on: ${new Date().toLocaleDateString()}</p>
        </div>
        <p style="color: #4a5568;">Keep up the great work! Your productivity is improving. 📈</p>
      `;
      
      await sendEmailNotification(req.user.email, subject, message);
    }

    res.json({ success: true, message: 'Task updated successfully', task });
  } catch (error) {
    console.error('Error updating task:', error);
    res.status(500).json({ success: false, message: 'Server error updating task' });
  }
});

// Delete task
app.delete('/api/tasks/:id', authMiddleware, async (req, res) => {
  try {
    const task = await Task.findOneAndDelete({ _id: req.params.id, userId: req.user._id });
    if (!task) {
      return res.status(404).json({ success: false, message: 'Task not found' });
    }
    res.json({ success: true, message: 'Task deleted successfully' });
  } catch (error) {
    console.error('Error deleting task:', error);
    res.status(500).json({ success: false, message: 'Server error deleting task' });
  }
});

// Get task statistics
app.get('/api/tasks-stats', authMiddleware, async (req, res) => {
  try {
    const tasks = await Task.find({ userId: req.user._id });
    const stats = {
      total: tasks.length,
      completed: tasks.filter(t => t.status === 'completed').length,
      inProgress: tasks.filter(t => t.status === 'inProgress').length,
      pending: tasks.filter(t => t.status === 'pending').length,
      overdue: tasks.filter(t => new Date(t.dueDate) < new Date() && t.status !== 'completed').length
    };
    res.json({ success: true, stats });
  } catch (error) {
    console.error('Error fetching task stats:', error);
    res.status(500).json({ success: false, message: 'Server error fetching statistics' });
  }
});

// Add this test endpoint to verify Gmail is working
app.get('/api/test-gmail', authMiddleware, async (req, res) => {
  try {
    const subject = 'Gmail Test - TaskMaster Pro';
    const message = `
      <h2 style="color: #2d3748; margin-bottom: 20px;">Gmail Test Successful! 🎉</h2>
      <p style="color: #4a5568; margin-bottom: 15px;">Hello <strong>${req.user.name}</strong>,</p>
      <p style="color: #4a5568; margin-bottom: 20px;">This is a test email to verify that Gmail is working correctly with your TaskMaster Pro application.</p>
      <div style="background: white; padding: 20px; border-radius: 8px; border-left: 4px solid #68d391; margin: 20px 0;">
        <p style="margin: 0; color: #4a5568;"><strong>✅ Email Service:</strong> Gmail</p>
        <p style="margin: 10px 0 0 0; color: #718096;">Your Gmail configuration is working properly!</p>
      </div>
    `;
    
    const emailSent = await sendEmailNotification(req.user.email, subject, message);
    
    if (emailSent) {
      res.json({ 
        success: true, 
        message: 'Gmail test email sent successfully! Please check your inbox.' 
      });
    } else {
      res.status(500).json({ 
        success: false, 
        message: 'Failed to send Gmail test email.' 
      });
    }
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      message: 'Server error sending test email' 
    });
  }
});

// === YOUR EXISTING AUTH ROUTES === //

app.post('/api/register', async (req, res) => {
  try {
    const { name, email, password } = req.body;
    const hashedPassword = await bcrypt.hash(password, 10);
    
    const user = new User({ name, email, password: hashedPassword });
    await user.save();

    if (user.emailNotifications) {
      const subject = 'Welcome to TaskMaster Pro! 🚀';
      const message = `
        <h2 style="color: #2d3748; margin-bottom: 20px;">Welcome aboard, ${name}! 🎉</h2>
        <p style="color: #4a5568; margin-bottom: 15px;">You've successfully registered for TaskMaster Pro - your ultimate productivity companion.</p>
        <p style="color: #4a5568; margin-bottom: 20px;">Get ready to:</p>
        <ul style="color: #4a5568; margin-bottom: 20px;">
          <li>Organize your tasks efficiently</li>
          <li>Track your productivity with analytics</li>
          <li>Receive smart reminders and notifications</li>
          <li>Achieve your goals faster</li>
        </ul>
        <div style="background: white; padding: 20px; border-radius: 8px; border-left: 4px solid #667eea; margin: 20px 0;">
          <p style="margin: 0; color: #4a5568;"><strong>Pro Tip:</strong> Start by creating your first task and experience the power of organized productivity!</p>
          <p style="margin: 10px 0 0 0; color: #718096;">Your default reminder time is set to 60 minutes before tasks are due. You can customize this in your notification settings.</p>
        </div>
        <p style="color: #4a5568;">We're excited to help you achieve more! Happy tasking! 🚀</p>
      `;
      
      await sendEmailNotification(email, subject, message);
    }

    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET || 'taskmaster-secret-key-2024');
    res.json({ 
      success: true, 
      message: 'User registered successfully',
      token,
      user: { 
        id: user._id, 
        name: user.name, 
        email: user.email,
        emailNotifications: user.emailNotifications,
        taskReminders: user.taskReminders,
        weeklyDigest: user.weeklyDigest,
        productivityReports: user.productivityReports,
        reminderTime: user.reminderTime
      }
    });
  } catch (error) {
    if (error.code === 11000) {
      res.status(400).json({ success: false, message: 'Email already exists' });
    } else {
      res.status(500).json({ success: false, message: 'Server error' });
    }
  }
});

app.post('/api/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    
    if (!user || !(await bcrypt.compare(password, user.password))) {
      return res.status(400).json({ success: false, message: 'Invalid credentials' });
    }

    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET || 'taskmaster-secret-key-2024');
    res.json({ 
      success: true, 
      message: 'Login successful',
      token,
      user: { 
        id: user._id, 
        name: user.name, 
        email: user.email,
        emailNotifications: user.emailNotifications,
        taskReminders: user.taskReminders,
        weeklyDigest: user.weeklyDigest,
        productivityReports: user.productivityReports,
        reminderTime: user.reminderTime
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

app.get('/api/me', authMiddleware, async (req, res) => {
  res.json({
    success: true,
    user: {
      id: req.user._id,
      name: req.user.name,
      email: req.user.email,
      emailNotifications: req.user.emailNotifications,
      taskReminders: req.user.taskReminders,
      weeklyDigest: req.user.weeklyDigest,
      productivityReports: req.user.productivityReports,
      reminderTime: req.user.reminderTime
    }
  });
});

app.put('/api/notification-settings', authMiddleware, async (req, res) => {
  try {
    const { emailNotifications, taskReminders, weeklyDigest, productivityReports, reminderTime } = req.body;
    
    const updatedUser = await User.findByIdAndUpdate(
      req.user._id, 
      { 
        emailNotifications,
        taskReminders,
        weeklyDigest,
        productivityReports,
        reminderTime
      },
      { new: true }
    );
    
    res.json({ 
      success: true, 
      message: 'Notification settings updated successfully',
      user: {
        id: updatedUser._id,
        name: updatedUser.name,
        email: updatedUser.email,
        emailNotifications: updatedUser.emailNotifications,
        taskReminders: updatedUser.taskReminders,
        weeklyDigest: updatedUser.weeklyDigest,
        productivityReports: updatedUser.productivityReports,
        reminderTime: updatedUser.reminderTime
      }
    });
  } catch (error) {
    console.error('Error updating notification settings:', error);
    res.status(500).json({ success: false, message: 'Server error updating settings' });
  }
});

// Add other existing routes here...

// Scheduled Jobs
nodeCron.schedule('*/15 * * * *', () => {
  notificationService.checkUpcomingTasks();
});

nodeCron.schedule('0 8 * * *', () => {
  notificationService.sendDailyDigest();
});

nodeCron.schedule('0 9 * * *', async () => {
  try {
    console.log('🔔 Checking for overdue tasks...');
    const overdueTasks = await Task.find({
      dueDate: { $lt: new Date() },
      status: { $in: ['pending', 'inProgress'] }
    }).populate('userId');

    let sentCount = 0;
    
    for (const task of overdueTasks) {
      if (task.userId && task.userId.emailNotifications && task.userId.taskReminders) {
        const subject = '⏰ Task Overdue Reminder - TaskMaster Pro';
        const message = `
          <h2 style="color: #2d3748; margin-bottom: 20px;">Reminder: Task Overdue</h2>
          <p style="color: #4a5568; margin-bottom: 15px;">Hello <strong>${task.userId.name}</strong>,</p>
          <p style="color: #4a5568; margin-bottom: 20px;">The following task is overdue:</p>
          <div style="background: white; padding: 20px; border-radius: 8px; border-left: 4px solid #fc8181; margin: 20px 0;">
            <h3 style="margin: 0 0 10px 0; color: #2d3748;">${task.title}</h3>
            <p style="margin: 5px 0; color: #4a5568;"><strong>Due Date:</strong> ${new Date(task.dueDate).toLocaleDateString()}</p>
            <p style="margin: 5px 0; color: #4a5568;"><strong>Priority:</strong> <span style="text-transform: capitalize; color: #fc8181;">${task.priority}</span></p>
            ${task.description ? `<p style="margin: 10px 0 0 0; color: #718096;">${task.description}</p>` : ''}
          </div>
          <p style="color: #4a5568;">Please update the task status or adjust the due date in your dashboard.</p>
        `;
        
        const emailSent = await sendEmailNotification(task.userId.email, subject, message);
        if (emailSent) sentCount++;
      }
    }

    console.log(`📧 Sent ${sentCount} overdue task reminders via Gmail`);
  } catch (error) {
    console.error('Error in scheduled job:', error);
  }
});

mongoose.connection.once('open', () => {
  console.log('✅ Connected to MongoDB');
  console.log('🔔 Notification scheduler initialized and running');
  console.log('📅 Scheduled jobs:');
  console.log('   - Upcoming tasks check: Every 15 minutes');
  console.log('   - Daily digest: Every day at 8:00 AM');
  console.log('   - Overdue tasks check: Every day at 9:00 AM');
});

mongoose.connection.on('error', (error) => {
  console.error('❌ MongoDB connection error:', error);
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📧 Email service: ${process.env.EMAIL_USER ? 'GMAIL' : 'DEVELOPMENT MODE'}`);
  if (!process.env.EMAIL_USER) {
    console.log('💡 To enable real emails, add to your .env file:');
    console.log('💡 EMAIL_USER=your-email@gmail.com');
    console.log('💡 EMAIL_PASS=your-gmail-app-password');
  } else {
    console.log('💡 Test Gmail: Use the "Send Test Email" feature in your app');
  }
});
