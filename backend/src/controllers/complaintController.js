const Complaint = require('../models/Complaint');

const isComplaintOwner = (complaint, userId) => {
  const ownerId = complaint.user?.toString() || complaint.userId?.toString();
  return ownerId === userId;
};

exports.createComplaint = async (req, res) => {
  try {
    console.log('📝 Incoming data:', req.body);
    console.log('🧑‍💻 User:', req.user);

    const { title, description, category, location } = req.body;

    if (!req.user?.id) {
      return res.status(401).json({ message: 'Not authorized to create complaint' });
    }

    if (!title || !description || !category) {
      return res.status(400).json({
        message: 'Missing required fields: title, description, and category are required',
      });
    }

    const complaint = new Complaint({
      title,
      category,
      description,
      location,
      user: req.user.id,
      userId: req.user.id,
    });

    const savedComplaint = await complaint.save();

    console.log('✅ Saved complaint:', savedComplaint);

    return res.status(201).json({
      success: true,
      complaint: savedComplaint,
    });
  } catch (error) {
    console.error('❌ Error saving complaint:', error);
    return res.status(500).json({ message: error.message || 'Server error while saving complaint' });
  }
};

exports.getComplaints = async (req, res, next) => {
  try {
    console.log('📋 Get complaints for user:', req.user.id);

    const complaints = await Complaint.find({
      $or: [{ user: req.user.id }, { userId: req.user.id }],
    }).sort({
      createdAt: -1,
    });

    console.log('✅ Complaints retrieved:', complaints.length);

    return res.json({
      complaints,
      total: complaints.length,
    });
  } catch (err) {
    console.error('❌ Error fetching complaints:', err.message || err);
    return res.status(500).json({ message: err.message || 'Server error while fetching complaints' });
  }
};

exports.getMyComplaints = async (req, res) => {
  try {
    console.log('📋 Get my complaints:', req.user.id);

    const complaints = await Complaint.find({
      $or: [{ user: req.user.id }, { userId: req.user.id }],
    });

    const total = complaints.length;
    const open = complaints.filter((c) => c.status === 'open').length;
    const resolved = complaints.filter((c) => c.status === 'resolved').length;

    console.log('✅ My complaints stats:', { total, open, resolved });

    return res.json({
      total,
      open,
      resolved,
    });
  } catch (err) {
    console.error('❌ Error fetching my complaints:', err.message || err);
    return res.status(500).json({ message: err.message || 'Server error while fetching my complaints' });
  }
};

exports.getComplaintById = async (req, res, next) => {
  try {
    const complaint = await Complaint.findById(req.params.id);

    if (!complaint) {
      return res.status(404).json({ message: 'Complaint not found' });
    }

    if (!isComplaintOwner(complaint, req.user.id)) {
      return res.status(403).json({ message: 'Unauthorized' });
    }

    return res.json(complaint);
  } catch (err) {
    console.error('❌ Error fetching complaint:', err.message || err);
    return res.status(500).json({ message: err.message || 'Server error while fetching complaint' });
  }
};

exports.updateComplaint = async (req, res, next) => {
  try {
    console.log('✏️ Update complaint:', req.params.id, req.body);

    const complaint = await Complaint.findById(req.params.id);

    if (!complaint) {
      return res.status(404).json({ message: 'Complaint not found' });
    }

    if (!isComplaintOwner(complaint, req.user.id)) {
      return res.status(403).json({ message: 'Unauthorized' });
    }

    const { title, description, category, priority } = req.body;

    if (title) complaint.title = title;
    if (description) complaint.description = description;
    if (category) complaint.category = category;
    if (priority) complaint.priority = priority;

    await complaint.save();

    console.log('✅ Complaint updated successfully:', complaint._id);

    res.json({
      message: 'Complaint updated successfully',
      complaint,
    });
  } catch (err) {
    console.error('❌ Error updating complaint:', err.message);
    next(err);
  }
};
