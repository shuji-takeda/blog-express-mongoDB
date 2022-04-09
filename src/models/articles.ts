export class ArticleModel {
  constructor(
    public title: string,
    public description: string,
    public markdown: string,
    public createdAt: Date,
    public slug: string,
    public sanitizedHtml: string
  ) {}
}
