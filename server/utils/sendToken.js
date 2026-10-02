const jwt = require('jsonwebtoken');

/**
 * Sign a JWT and attach it as an HTTP-only cookie.
 * Also returns the token for Authorization-header clients.
 */
const sendTokenCookie = (user, statusCode, res) => {
  const token = jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE || '7d',
  });

  const cookieOptions = {
    expires: new Date(Date.now() + (parseInt(process.env.COOKIE_EXPIRE, 10) || 7) * 24 * 60 * 60 * 1000),
    httpOnly: true,
    sameSite: 'strict',
    secure: process.env.NODE_ENV === 'production',
  };

  res.cookie('token', token, cookieOptions);

  res.status(statusCode).json({
    success: true,
    token,
    user: {
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      status: user.status,
      avatar: user.avatar,
    },
  });
};

module.exports = sendTokenCookie;
