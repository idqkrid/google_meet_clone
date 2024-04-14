const User = require('../schemas/User');
const jwt = require('jsonwebtoken');

exports.auth = async (req, res, next) => {
  let token = req.cookies.token;

  try {
    const decoded = jwt.verify(token, 'secretToken');

    const user = await User.findOne({ "_id": decoded.userId, "token": token }).exec();
  
    if (!user) {
      return res.status(401).json({ isAuth: false, error: true, message: '인증에 실패했습니다.1' });
    }
  
    req.user = user;
    next();
  } catch (err) {
    return res.status(401).json({ isAuth: false, error: true, message: '인증에 실패했습니다.1' });
  }
}
