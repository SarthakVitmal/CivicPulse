import mongoose from 'mongoose';

const IssueSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      required: true,
    },
    category: {
      type: String,
      required: true,
      enum: [
        'Road & Infrastructure',
        'Water Supply',
        'Electricity',
        'Waste Management',
        'Street Lights',
        'Public Transport',
        'Parks & Recreation',
        'Health & Sanitation',
        'Education',
        'Safety & Security',
        'Other',
      ],
    },
    status: {
      type: String,
      enum: ['Pending', 'In Progress', 'Resolved', 'Rejected'],
      default: 'Pending',
    },
    priority: {
      type: String,
      enum: ['Low', 'Medium', 'High', 'Critical'],
      default: 'Medium',
    },
    location: {
      type: {
        type: String,
        enum: ['Point'],
        required: true,
      },
      coordinates: {
        type: [Number], // [longitude, latitude]
        required: true,
      },
    },
    address: {
      type: String,
      required: true,
    },
    photos: [
      {
        url: String,
        publicId: String,
      },
    ],
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    upvotes: {
      type: Number,
      default: 0,
    },
    upvotedBy: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
      },
    ],
    comments: [
      {
        userId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'User',
        },
        text: String,
        createdAt: {
          type: Date,
          default: Date.now,
        },
      },
    ],
    assignedTo: {
      type: String, // Department or official name
    },
    resolvedAt: Date,
  },
  {
    timestamps: true,
  }
);

// Create geospatial index for location-based queries
IssueSchema.index({ location: '2dsphere' });
IssueSchema.index({ userId: 1 });
IssueSchema.index({ status: 1 });
IssueSchema.index({ createdAt: -1 });

export default mongoose.models.Issue || mongoose.model('Issue', IssueSchema);

