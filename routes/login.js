var express = require('express');
var router = express.Router();
const session = require('express-session');
const {PrismaClient}= require("@prisma/client")
var prisma= new PrismaClient
const bcrypt = require('bcrypt');

// Initialize the session middleware
router.use(session({
  secret: 'your-secret-key',
  resave: false,
  saveUninitialized: true
}));


/* GET home page. */
router.get('/login', async function(req, res, next) {
    // If user is already logged in, redirect to appropriate page
    if (req.session.user) {
      switch (req.session.user.usertype) {
        case "admin":
          res.redirect("/admin");
          break;
        case "manager":
          res.redirect("/manager");
          break;
        case "user":
          res.redirect("/users");
          break;
        default:
          res.status(400).send("Invalid userType");
      }
      return;
    }
  
    // Otherwise, render the login page
    res.render('login', { title: 'Login' });
});
 

router.post('/login', async function (req, res, next) {
  const { email, password } = req.body;
  try {
    const user = await prisma.user.findUnique({
      where: { email: email },
    });

    if (!user) {
      // User with the provided email not found
      return res.render('login', { errorMessage: 'Invalid username or password' });
    }

    if (user.password) {
      const passwordMatch = await bcrypt.compare(password, user.password);

      if (passwordMatch) {
        // Save user data in session
        req.session.user = user;

        switch (user.usertype) {
          case 'admin':
            return res.redirect('/admin');
          case 'manager':
            return res.redirect('/manager');
          case 'user':
            return res.redirect('/users');
          default:
            return res.status(400).send('Invalid userType');
        }
      }
    }

    return res.render('login', { errorMessage: 'Invalid username or password' });
  } catch (error) {
    console.error(error);
    return res.status(500).send('Something went wrong');
  }
});

/* GET logout page. */
router.get('/logout', function(req, res, next) {
  req.session.destroy(err => {
    if (err) {
      console.error(err)
    } else {
      res.redirect('/login')
    }
  })
});


module.exports = router;
