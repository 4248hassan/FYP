const User = require('../models/User');
const cloudinary = require('cloudinary').v2;

// Note: Cloudinary will be configured in each function that needs it
// to ensure environment variables are loaded

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

    // Get the current user to preserve profileImage if not provided
    const currentUser = await User.findById(req.user.id);
    if (!currentUser) return res.status(404).json({ message: 'User not found' });

    // Build update object - always preserve existing profileImage if not explicitly provided
    const updateData = {};
    if (name !== undefined) updateData.name = name;
    if (email !== undefined) updateData.email = email;
    if (phone !== undefined) updateData.phone = phone;
    if (city !== undefined) updateData.city = city;
    if (address !== undefined) updateData.address = address;
    if (postalCode !== undefined) updateData.postalCode = postalCode;
    
    // For profileImage: use provided value if not empty, otherwise keep existing
    if (profileImage) {
      updateData.profileImage = profileImage;
    } else {
      // If profileImage not provided or empty, keep the existing one from database
      updateData.profileImage = currentUser.profileImage || '';
    }

    const updated = await User.findByIdAndUpdate(
      req.user.id,
      updateData,
      { new: true, runValidators: true, context: 'query' },
    ).select('-password');

    if (!updated) return res.status(404).json({ message: 'User not found' });
    
    // Ensure profileImage is always in response (fallback to current user's image if missing)
    const responseUser = updated.toObject ? updated.toObject() : updated;
    if (!responseUser.profileImage && currentUser.profileImage) {
      responseUser.profileImage = currentUser.profileImage;
    }
    
    res.json({ user: responseUser });
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
    console.log('📸 Upload request received');
    console.log('User ID:', req.user?.id);
    console.log('File:', req.file ? { name: req.file.originalname, size: req.file.size, mime: req.file.mimetype } : 'No file');
    
    if (!req.file) {
      console.log('❌ No file in request');
      return res.status(400).json({ message: 'No file uploaded' });
    }

    // Configure Cloudinary inside the function to ensure env vars are loaded
    console.log('⚙️ Configuring Cloudinary...');
    console.log('Cloud Name:', process.env.CLOUDINARY_CLOUD_NAME ? '✓ Set' : '✗ Missing');
    console.log('API Key:', process.env.CLOUDINARY_API_KEY ? '✓ Set' : '✗ Missing');
    console.log('API Secret:', process.env.CLOUDINARY_API_SECRET ? '✓ Set' : '✗ Missing');
    
    cloudinary.config({
      cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
      api_key: process.env.CLOUDINARY_API_KEY,
      api_secret: process.env.CLOUDINARY_API_SECRET,
    });

    console.log('📤 Uploading to Cloudinary...');
    const result = await new Promise((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        {
          folder: 'resolveit-profile',
          resource_type: 'auto',
          transformation: [{ width: 1000, height: 1000, crop: 'limit' }],
        },
        (error, uploadResult) => {
          if (error) {
            console.log('❌ Cloudinary upload error:', error);
            return reject(error);
          }
          console.log('✅ Cloudinary upload success:', uploadResult.secure_url);
          resolve(uploadResult);
        }
      );

      uploadStream.end(req.file.buffer);
    });

    console.log('💾 Saving to database...');
    const updated = await User.findByIdAndUpdate(
      req.user.id,
      { profileImage: result.secure_url },
      { new: true, runValidators: true, context: 'query' },
    ).select('-password');

    if (!updated) {
      console.log('❌ User not found after update');
      return res.status(404).json({ message: 'User not found' });
    }

    console.log('✅ Profile image updated:', updated.profileImage);
    res.json({ user: updated });
  } catch (err) {
    console.log('❌ Upload error:', err.message);
    next(err);
  }
};
