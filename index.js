const express = require('express')
const { MongoClient } = require('mongodb');
const app = express()
require('dotenv').config()
const cors = require('cors')
const port = process.env.PORT || 5000
app.use(cors());
app.use(express.json());
//single data loading by objectId
const ObjectId = require('mongodb').ObjectId;

//configure midleware cors

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.fdztw.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });





async function run() {
    try {
        await client.connect();
        const database = client.db('wiperStory');
        const CarListCollection = database.collection('carListDb');
        const usersCollection = database.collection('users')


        //GET APi to get data 


        //save email pass auth data to mongodb
        app.post('/users', async (req, res) => {
            const user = req.body;
            const result = await usersCollection.insertOne(user)
            res.json(result);
        })

        //api for make admin
        app.put('/users/admin', async (req, res) => {
            const user = req.body;
            const filter = { email: user.email }
            const updateDoc = { $set: { role: 'admin' } };
            const result = await usersCollection.updateOne(filter, updateDoc)
            res.json(result);
        })

        //api for check user admin or not for admin private route
        app.get('/users/:email', async (req, res) => {
            const email = req.params.email;
            const query = { email: email };
            const user = await usersCollection.findOne(query);
            let isAdmin = false;
            if (user?.role === 'admin') {
                isAdmin = true;
            }

            res.json({ admin: isAdmin });
        })


        //api foro load car list db data
        app.get('/carlist', async (req, res) => {

            const cursor = CarListCollection.find({});
            const allCar = await cursor.toArray();
            res.send(allCar)
        });
        app.get('/filtercarlist', async (req, res) => {

            const cursor = CarListCollection.find({});

            const allCar = await cursor.toArray();
            res.send(allCar)
        });

        //API for single company data load
        app.get('/carlist/:make', async (req, res) => {
            const make = req.params.make;

            const query = { Make: make };

            const cursor = await CarListCollection.find(query);
            const products = await cursor.toArray();
            res.json(products);
        });

        console.log('db connected');
    } finally {

        //await client.close();
    }
}
run().catch(console.dir);



app.get('/', (req, res) => {
    res.send('Hello World!')
})

app.listen(port, () => {
    console.log(`Example app listening at http://localhost:${port}`)
})
