const express = require('express');
const { engine } = require('express-handlebars');
const path = require('path');

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'static')));

app.set('view engine', '.hbs');
app.engine('.hbs', engine({defaultLayout: false}));
app.set('views', path.join(__dirname, 'static'));

const users = [];
let error = '';

app.get('/login', (req, res) => {
    res.render('login');
})

app.post('/login', ({ body }, res) => {
    const userExist = users.some(user => user.email === body.email);
    if (userExist) {
        error = 'User already exists!';
        res.redirect('/error');
        return;
    }

    users.push({ ...body, id: users.length ? users[users.length - 1].id + 1 : 1 });
    res.redirect('/users');
});

app.get('/users', ({ query }, res) => {
    if (Object.keys(query).length) {
        let usersArray = [...users];
        if (query.city) {
            usersArray = usersArray.filter(user => user.city === query.city);
        }
        if (query.age) {
            usersArray = usersArray.filter(user => user.age === query.age);
        }

        res.render('users', { users: usersArray });
        return;
    }

    res.render('users', { users });
});

app.get('/users/:userId', ({ params }, res) => {
    const user = users.find(user => user.id === +params.userId);
    if (!user) {
        error = `User already exists!`;
        res.redirect('/error');
        return;
    }

    res.render('userInfo', { user });
});

app.get('/signIn', (req, res) => {
    res.render('signIn');
})

app.post('/signIn', ({ body }, res) => {
    const user = users.find(user => user.email === body.email && user.password === body.password);
    if (!user) {
        error = 'Try again!';
        res.redirect('/error');
        return;
    }

    res.redirect(`/users/${user.id}`);
});

app.get('/error', (req, res) => {
    res.render('error', { error });
});

app.use((req, res) => {
    res.render('notFound');
});

app.listen(5100, () => {
    console.log('Server started');
});