const User = require('../models/User');
const cloudinary = require('cloudinary').v2;

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

exports.getProfile = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    if (!user) return res.status(404).json({ message: 'User not found' });
    res.json({ user });
  } catch (err) {
    next(err);
  }
};

exports.updateProfile = async (req, res, next) => {
  try {
    const { name, email, phone, city, address, postalCode, profileImage } = req.body;
    const existing = await User.findOne({ email, _id: { $ne: req.user.id } });
    if (existing) return res.status(400).json({ message: 'Email already in use' });

    const updated = await User.findByIdAndUpdate(
      req.user.id,
      { name, email, phone, city, address, postalCode, profileImage },
      { new: true, runValidators: true, context: 'query' },
    ).select('-password');

    if (!updated) return res.status(404).json({ message: 'User not found' });
    res.json({ user: updated });
  } catch (err) {
    next(err);
  }
};

exports.changePassword = async (req, res, next) => {
  try {
    const { oldPassword, newPassword } = req.body;
    if (!oldPassword || !newPassword) {
      return res.status(400).json({ message: 'Old password and new password are required' });
    }

    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ message: 'User not found' });

    const isMatch = await user.matchPassword(oldPassword);
    if (!isMatch) return res.status(401).json({ message: 'Old password is incorrect' });

    user.password = newPassword;
    await user.save();

    res.json({ message: 'Password updated successfully' });
  } catch (err) {
    next(err);
  }
};

exports.uploadProfilePic = async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }

    const result = await new Promise((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        {
          folder: 'resolveit-profile',
          transformation: [{ width: 1000, height: 1000, crop: 'limit' }],
        },
        (error, uploadResult) => {
          if (error) return reject(error);
          resolve(uploadResult);
        }
      );

      uploadStream.end(req.file.buffer);
    });

    const updated = await User.findByIdAndUpdate(
      req.user.id,
      { profileImage: result.secure_url },
      { new: true, runValidators: true, context: 'query' },
    ).select('-password');

    if (!updated) return res.status(404).json({ message: 'User not found' });

    res.json({ user: updated });
  } catch (err) {
    next(err);
  }
};
