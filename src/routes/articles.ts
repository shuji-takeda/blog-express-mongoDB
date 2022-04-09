import express, { Request, Response, NextFunction } from 'express';
import { ArticleModel } from '../models/articles';
import { MongoClient, ObjectId, DeleteResult } from 'mongodb';
import { IArticle } from '../models/interface/IArticle';
import { marked } from 'marked';
import DOMPurify from 'dompurify';

require('dotenv').config();
const env = process.env;

const articleRouter = express.Router();
// Connection URI
const uri: string = env.MONGODB_URL || '';

// Create a new MongoClient
const client = new MongoClient(uri);

articleRouter.post('/', async (req, res) => {
  console.log('root : Post');
  await client.connect();
  await client.db('admin').command({ ping: 1 });
  const database = client.db('Cluster0');
  const kiji = database.collection<IArticle>('Cluster0');
  const post_newArticle: IArticle = {
    title: req.body.title,
    description: req.body.description ? req.body.description : '',
    markdown: req.body.markdown ? req.body.markdown : '',
    createdAt: new Date(),
  };
  const a = await kiji.insertOne(post_newArticle);
  res.redirect(`./${a.insertedId}`);
});

articleRouter.get('/edit/:id', async (req, res) => {
  const article = await getOne(new ObjectId(req.params.id));
  if (article) {
    console.log(article);
    res.render('articles/edit-article', { article: article });
  }
});

articleRouter.get('/new', (req, res) => {
  console.log('new : Get');
  const newArticle = new ArticleModel('', '', '', new Date(), '', '');
  res.render('articles/new', { article: newArticle });
});

articleRouter.get('/:id', async (req, res) => {
  console.log('id : Get');
  const result = await getOne(new ObjectId(req.params.id));
  if (result) {
    const article: IArticle = {
      title: result.title,
      description: result.description,
      markdown: result.markdown,
      createdAt: result.createdAt,
      slug: req.params.id,
      sanitizedHtml: marked(result.markdown),
    };
    res.render('articles/article', { article: article });
  } else {
    res.redirect('articles/new');
  }
});

articleRouter.post('/:id', async (req, res) => {
  const id = new ObjectId(req.params.id);
  const count = await updateOne(id, req);
  if (count) {
    res.redirect(`/articles/${req.params.id}`);
  }
});

articleRouter.post('/:id/delete', async (req, res) => {
  const id = new ObjectId(req.params.id);
  const result = await deleteOne(id);
  if (result === 1) {
    console.log('Successfully deleted one document!!!');
  } else {
    console.log('No documents matched the query...');
  }
  res.redirect('/');
});

export default articleRouter;

async function getOne(id: ObjectId) {
  await client.connect();
  await client.db('admin').command({ ping: 1 });
  const database = client.db('Cluster0');
  const collection = database.collection<ArticleModel>('Cluster0');
  const result = await collection.findOne<ArticleModel>({
    _id: id,
  });
  return result;
}

async function updateOne(id: ObjectId, req: Request) {
  await client.connect();
  await client.db('admin').command({ ping: 1 });
  const database = client.db('Cluster0');
  const collection = database.collection<ArticleModel>('Cluster0');
  const result = await collection.updateOne(
    { _id: id },
    {
      $set: {
        title: req.body.title,
        description: req.body.description,
        markdown: req.body.markdown,
      },
    }
  );
  return result;
}

async function deleteOne(id: ObjectId) {
  await client.connect();
  await client.db('admin').command({ ping: 1 });
  const database = client.db('Cluster0');
  const collection = database.collection<ArticleModel>('Cluster0');
  const result = await collection.deleteOne({
    _id: id,
  });
  return result.deletedCount;
}
