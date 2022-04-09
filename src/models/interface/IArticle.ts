export interface IArticle {
  title:string,
  description?:string,
  markdown?:string,
  createdAt:Date
  slug?:string,
  sanitizedHtml?:string
}
