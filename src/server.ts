import expressClient, { Request, Response, NextFunction } from 'express';
import { MongoClient, ObjectId } from 'mongodb';
import { ArticleModel } from './models/articles';
import articleRouter from './routes/articles';


require('dotenv').config();
const env = process.env;
// Connection URI
const uri: string = env.MONGODB_URL || '';

// Create a new MongoClient
const client = new MongoClient(uri);

const express = expressClient();
express.use(expressClient.urlencoded({ extended: true }));
express.use(logger);
express.set('view engine', 'ejs');
express.use('/articles', articleRouter);

express.get('/', async (req, res) => {
  let mock_articles: ArticleModel[] = [];

  const result = await run().catch((error) => {
    console.log(error);
  });
  if (result) {
    mock_articles = result;
  }
  res.render('index', { articles: mock_articles });
});

express.listen(3000);

async function run(): Promise<null | ArticleModel[]> {
  let result: ArticleModel[] = [];
  try {
    // Connect the client to the server
    await client.connect();
    // Establish and verify connection
    await client.db('admin').command({ ping: 1 });
    const database = client.db('Cluster0');
    const movies = database.collection<ArticleModel>('Cluster0');
    const cursor = await movies.find<ArticleModel>({});
    await cursor.forEach((value) => {
      result.push(value);
    });
  } finally {
    // Ensures that the client will close when you finish/error
    await client.close();
  }
  return result;
}

function logger(req: Request, res: Response, next: NextFunction) {
  console.log('URL is ' + req.originalUrl);
  next();
}
