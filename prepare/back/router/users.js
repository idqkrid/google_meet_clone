const express = require('express');
const User = require('../schemas/User');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const router = express.Router();
const { auth } = require("./middlewares");

router.get('/', async (req, res, next) => {
  let token = req.cookies.token;

  try {
    const decoded = jwt.verify(token, 'secretToken');

    //console.log(decoded)

    const user = await User.findOne({ "_id": decoded.userId, "token": token }).exec();


    if (!user) {
      return res.status(401).json({ isAuth: false, error: true, message: '인증에 실패했습니다.1' });
    }
  
    req.user = user;

    res.status(200).json({
      _id: req.user._id,
      isAdmin: req.user.role === 0 ? false : true,
      isAuth: true,
      email: req.user.email,
      name: req.user.name,
      lastname: req.user.lastname,
      role: req.user.role,
      image: req.user.image
    })
  } catch (err) {
    return res.status(401).json({ isAuth: false, error: true, message: '인증에 실패했습니다.1' });
  }


})

// 회원가입
router.post('/regitsre', async (req, res, next) => {
  try {
    const saltRounds = 10; // salt rounds 값 설정
    const hashedPassword = await bcrypt.hash(req.body.password, saltRounds);

    const user = await User.create({
      name: req.body.name,
      email: req.body.email,
      password: hashedPassword,
    });
    res.status(200).json({ success: true})
  } catch (err) {
    console.error(err);
    res.status(403).json({ fail: "회원가입이 실패했습니다."})
    next(err);
  }
});

// 로그인
router.post('/login', async (req, res, next) => {
  try {
    const user = await User.findOne({ email: req.body.email });

    if (!user) {
      return res.status(401).json({
        loginSuccess: false,
        message: "제공된 이메일에 해당하는 유저가 없습니다."
      });
    }

    const isMatch = await bcrypt.compare(req.body.password, user.password);

    if (!isMatch) {
      return res.status(401).json({ loginSuccess: false, message: "비밀번호가 일치하지 않습니다." });
    }

    const token = jwt.sign({ userId: user._id }, 'secretToken');
    user.token = token;
    await user.save();

    res.cookie('token', token, { httpOnly: true, secure: false });

    res.status(200).json({ loginSuccess: true, userId: user._id})
  } catch (err) {
    console.error(err);
    res.status(401).json({ loginSuccess: false})
    next(err);
  }
});

// auth 정보 호출
router.get('/auth', auth, (req, res, next) => {
  res.status(200).json({
    _id: req.user._id,
    isAdmin: req.user.role === 0 ? false : true,
    isAuth: true,
    email: req.user.email,
    name: req.user.name,
    lastname: req.user.lastname,
    role: req.user.role,
    image: req.user.image
  })
})

// 로그아웃
// router.get('/logout', auth, async (req, res, next) => {
//   console.log(req)
//   const user = await User.updateOne({
//     _id: req.user._id
//   }, {
//     token: ""
//   });
//   res.status(200).send({ success: true });
// });

router.get('/logout', auth, async (req, res, next) => {
  const user = await User.updateOne({
    _id: req.user._id
  }, {
    token: ""
  });
  res.status(200).send({ success: true });
});

module.exports = router;