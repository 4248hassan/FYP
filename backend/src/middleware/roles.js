// Optional: role helper middleware (not used directly since auth.requireRole exists)
module.exports = {
  only: (role) => (req, res, next) => {
    if (!req.user) return res.status(401).json({ message: 'Not authenticated' });
    if (req.user.role !== role) return res.status(403).json({ message: 'Forbidden' });
    next();
  },
};
